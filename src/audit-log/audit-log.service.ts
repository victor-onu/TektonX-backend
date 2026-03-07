import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(data: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    details?: object;
  }): Promise<AuditLog> {
    const entry = this.auditRepo.create(data);
    return this.auditRepo.save(entry);
  }

  async getAll(filters: { action?: string; page: number; limit: number }) {
    const { action, page, limit } = filters;
    const qb = this.auditRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.admin', 'admin');
    if (action) qb.andWhere('a.action = :action', { action });
    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('a.createdAt', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
