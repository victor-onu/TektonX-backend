import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';

export interface UpdateUserData {
  name?: string;
  whatsapp?: string;
  bio?: string;
  title?: string;
  profilePhotoUrl?: string;
  experienceYears?: number;
  linkedinUrl?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } }) ?? null;
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async updateMe(userId: string, data: UpdateUserData): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, data);
    return this.userRepo.save(user);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.userRepo.update(userId, { passwordHash });
  }

  async updateNotificationPreferences(userId: string, prefs: object): Promise<User> {
    const user = await this.findById(userId);
    user.emailNotifications = { ...user.emailNotifications, ...prefs } as any;
    return this.userRepo.save(user);
  }

  async updateMilestoneCount(userId: string, milestone: number, count: number): Promise<User> {
    const user = await this.findById(userId);
    if (milestone === 1) user.milestone1Completed = count;
    else if (milestone === 2) user.milestone2Completed = count;
    else if (milestone === 3) user.milestone3Completed = count;
    return this.userRepo.save(user);
  }

  async getApprovedMentors(track?: string): Promise<Partial<User>[]> {
    const qb = this.userRepo.createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.MENTOR })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .select([
        'user.id', 'user.name', 'user.track', 'user.bio',
        'user.title', 'user.profilePhotoUrl', 'user.linkedinUrl',
      ]);
    if (track) qb.andWhere('user.track = :track', { track });
    return qb.getMany();
  }

  async updateStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.findById(userId);
    user.status = status;
    return this.userRepo.save(user);
  }

  async updateRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.findById(userId);
    user.role = role;
    return this.userRepo.save(user);
  }

  async countAdmins(): Promise<number> {
    return this.userRepo.count({ where: { role: UserRole.ADMIN } });
  }
}
