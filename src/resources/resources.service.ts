import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './entities/resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: Repository<Resource>,
  ) {}

  async getByTaskId(taskId: string): Promise<Resource[]> {
    return this.resourceRepo.find({ where: { taskId }, order: { createdAt: 'ASC' } });
  }

  async getByTrack(track: string): Promise<Resource[]> {
    return this.resourceRepo.find({ where: { track }, order: { createdAt: 'ASC' } });
  }

  async getByCreator(userId: string): Promise<Resource[]> {
    return this.resourceRepo.find({ where: { createdBy: userId }, order: { createdAt: 'ASC' } });
  }

  async getAll(): Promise<Resource[]> {
    return this.resourceRepo.find({ order: { createdAt: 'ASC' } });
  }

  async create(dto: CreateResourceDto, userId: string, userTrack?: string): Promise<Resource> {
    if (!dto.taskId && !dto.track && !userTrack) {
      throw new BadRequestException('Either taskId or track is required');
    }
    const resource = this.resourceRepo.create({
      ...dto,
      track: dto.track ?? userTrack ?? null,
      createdBy: userId,
    });
    return this.resourceRepo.save(resource);
  }

  async update(id: string, dto: UpdateResourceDto, user: User): Promise<Resource> {
    const resource = await this.resourceRepo.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('Resource not found');
    if (user.role !== UserRole.ADMIN && resource.createdBy !== user.id) {
      throw new ForbiddenException('You can only edit your own resources');
    }
    Object.assign(resource, dto);
    return this.resourceRepo.save(resource);
  }

  async delete(id: string, user: User): Promise<void> {
    const resource = await this.resourceRepo.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('Resource not found');
    if (user.role !== UserRole.ADMIN && resource.createdBy !== user.id) {
      throw new ForbiddenException('You can only delete your own resources');
    }
    await this.resourceRepo.remove(resource);
  }
}
