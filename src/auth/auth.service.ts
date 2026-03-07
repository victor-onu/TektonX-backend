import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserStatus } from '../common/enums/user-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const status =
      dto.role === 'mentor' ? UserStatus.PENDING_APPROVAL : UserStatus.ACTIVE;

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role as UserRole,
      status,
      track: dto.track,
      whatsapp: dto.whatsapp,
      bio: dto.bio,
      title: dto.title,
      experienceYears: dto.experienceYears,
      linkedinUrl: dto.linkedinUrl,
    });

    if (dto.role === 'mentor') {
      await this.mailService
        .sendMentorApplicationReceived(user.email, user.name)
        .catch(() => {});
    } else {
      await this.mailService.sendWelcomeMentee(user.email, user.name).catch(() => {});
    }

    return {
      message:
        dto.role === 'mentor'
          ? 'Application submitted for review'
          : 'Registration successful',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await user.validatePassword(dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid token type');

      const user = await this.usersService.findById(payload.sub);
      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (user) {
      const token = this.jwtService.sign(
        { sub: user.id, type: 'password_reset' },
        {
          secret: this.configService.get<string>('jwt.secret') as string,
          expiresIn: '1h' as any,
        },
      );
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;
      await this.mailService.sendPasswordReset(user.email, user.name, resetLink).catch(() => {});
    }
    return {
      message: 'If an account with that email exists, a reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(dto.token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      if (payload.type !== 'password_reset') throw new BadRequestException('Invalid token');

      const passwordHash = await bcrypt.hash(dto.newPassword, 12);
      await this.usersService.updatePassword(payload.sub, passwordHash);
      return { message: 'Password reset successfully' };
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  private generateAccessToken(user: any): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role, status: user.status },
      {
        secret: this.configService.get<string>('jwt.secret') as string,
        expiresIn: (this.configService.get<string>('jwt.accessExpiration') || '15m') as any,
      },
    );
  }

  private generateRefreshToken(user: any): string {
    return this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.configService.get<string>('jwt.secret') as string,
        expiresIn: (this.configService.get<string>('jwt.refreshExpiration') || '7d') as any,
      },
    );
  }
}
