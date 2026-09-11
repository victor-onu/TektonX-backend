import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityMember } from './entities/community-member.entity';
import { CreateCommunityMemberDto } from './dto/create-community-member.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CommunityMembersService {
  constructor(
    @InjectRepository(CommunityMember)
    private readonly repo: Repository<CommunityMember>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateCommunityMemberDto): Promise<{ message: string }> {
    // Normalize so "Foo@Bar.com" and "foo@bar.com" are treated as the same
    // person — both for the duplicate check below and for what's stored.
    const email = dto.email.trim().toLowerCase();
    const duplicateMessage =
      'This email is already part of the TektonX community.';

    const existing = await this.repo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException(duplicateMessage);
    }

    const member = this.repo.create({
      name: dto.name,
      email,
      phone: dto.phone ?? null,
      state: dto.state,
    });

    try {
      await this.repo.save(member);
    } catch (err) {
      // Belt-and-braces against a race between two near-simultaneous
      // submissions with the same email — the DB's unique(email) index
      // rejects the second insert with Postgres error 23505.
      if ((err as { code?: string })?.code === '23505') {
        throw new ConflictException(duplicateMessage);
      }
      throw err;
    }

    this.mailService
      .sendCommunityMemberConfirmation(email, dto.name)
      .catch(() => {});
    this.mailService
      .sendCommunityMemberAdminNotification(
        dto.name,
        email,
        dto.phone,
        dto.state,
      )
      .catch(() => {});
    return {
      message:
        'Welcome to the TektonX community! Keep an eye on your inbox for updates.',
    };
  }

  async findAll(): Promise<CommunityMember[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async exportCsv(): Promise<string> {
    const members = await this.findAll();
    const header = 'id,name,email,phone,state,createdAt\n';
    const rows = members
      .map(
        (m) =>
          `${m.id},"${m.name}","${m.email}","${m.phone ?? ''}","${m.state}","${m.createdAt.toISOString()}"`,
      )
      .join('\n');
    return header + rows;
  }
}
