import { Injectable } from '@nestjs/common';
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
    const member = this.repo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      state: dto.state,
    });
    await this.repo.save(member);
    this.mailService
      .sendCommunityMemberConfirmation(dto.email, dto.name)
      .catch(() => {});
    this.mailService
      .sendCommunityMemberAdminNotification(
        dto.name,
        dto.email,
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
