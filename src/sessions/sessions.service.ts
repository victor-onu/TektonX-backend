import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { MentorshipSession } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(MentorshipSession)
    private readonly sessionRepo: Repository<MentorshipSession>,
  ) {}

  async getAll(): Promise<MentorshipSession[]> {
    return this.sessionRepo.find({ order: { date: 'ASC' } });
  }

  async getUpcoming(): Promise<MentorshipSession[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.sessionRepo.find({
      where: { date: MoreThanOrEqual(today) as any },
      order: { date: 'ASC' },
    });
  }

  async getById(id: string): Promise<MentorshipSession> {
    const s = await this.sessionRepo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Session not found');
    return s;
  }

  async create(dto: CreateSessionDto, userId: string): Promise<MentorshipSession> {
    const session = this.sessionRepo.create({ ...dto, createdBy: userId });
    return this.sessionRepo.save(session);
  }

  async update(id: string, dto: UpdateSessionDto): Promise<MentorshipSession> {
    const s = await this.getById(id);
    Object.assign(s, dto);
    return this.sessionRepo.save(s);
  }

  async delete(id: string): Promise<void> {
    const s = await this.getById(id);
    await this.sessionRepo.remove(s);
  }
}
