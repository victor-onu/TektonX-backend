import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cohort } from './entities/cohort.entity';
import { User } from '../users/entities/user.entity';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';

@Injectable()
export class CohortsService {
  constructor(
    @InjectRepository(Cohort) private readonly cohortRepo: Repository<Cohort>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateCohortDto): Promise<Cohort> {
    const existing = await this.cohortRepo.findOne({ where: { number: dto.number } });
    if (existing) throw new ConflictException(`Cohort ${dto.number} already exists`);
    const cohort = this.cohortRepo.create(dto);
    return this.cohortRepo.save(cohort);
  }

  async findAll(): Promise<Cohort[]> {
    return this.cohortRepo.find({ order: { number: 'ASC' } });
  }

  async findOne(id: string): Promise<Cohort> {
    const cohort = await this.cohortRepo.findOne({ where: { id } });
    if (!cohort) throw new NotFoundException('Cohort not found');
    return cohort;
  }

  async update(id: string, dto: UpdateCohortDto): Promise<Cohort> {
    const cohort = await this.findOne(id);
    Object.assign(cohort, dto);
    return this.cohortRepo.save(cohort);
  }

  async delete(id: string): Promise<void> {
    const cohort = await this.findOne(id);
    await this.cohortRepo.remove(cohort);
  }

  async getCohortMembers(cohortId: string): Promise<User[]> {
    return this.userRepo.find({ where: { cohortId } });
  }
}
