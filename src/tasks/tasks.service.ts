import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const TASKS_PER_MILESTONE = 16;

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async getTemplates(milestone?: number): Promise<Task[]> {
    const qb = this.taskRepo
      .createQueryBuilder('task')
      .where('task.userId IS NULL')
      .orderBy('task.milestone', 'ASC')
      .addOrderBy('task.week', 'ASC');
    if (milestone) qb.andWhere('task.milestone = :milestone', { milestone });
    return qb.getMany();
  }

  async getMyTasks(userId: string): Promise<Task[]> {
    return this.taskRepo.find({
      where: { userId },
      order: { milestone: 'ASC', week: 'ASC' },
    });
  }

  async createPersonalCopy(userId: string, dto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepo.create({ ...dto, userId, completed: dto.completed ?? false });
    return this.taskRepo.save(task);
  }

  async updateTask(taskId: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Access denied');
    task.completed = dto.completed;
    await this.taskRepo.save(task);

    // Recalculate milestone count
    const count = await this.taskRepo.count({
      where: { userId, milestone: task.milestone, completed: true },
    });
    await this.usersService.updateMilestoneCount(userId, task.milestone, count);

    // Fire program-completion email when milestone 3 is fully done
    if (task.milestone === 3 && count === TASKS_PER_MILESTONE) {
      const user = await this.usersService.findById(userId);
      this.mailService.sendMilestoneCompleted(user.email, user.name, user.track).catch(() => {});
    }

    return task;
  }

  async getTasksByUserId(userId: string, milestone?: number): Promise<Task[]> {
    const where: any = { userId };
    if (milestone) where.milestone = milestone;
    return this.taskRepo.find({ where, order: { milestone: 'ASC', week: 'ASC' } });
  }

  async createTemplateTask(dto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepo.create({ ...dto, userId: null });
    return this.taskRepo.save(task);
  }

  async updateTemplateTask(id: string, dto: Partial<CreateTaskDto>): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id, userId: null as any } });
    if (!task) throw new NotFoundException('Template task not found');
    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  async deleteTemplateTask(id: string): Promise<void> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    await this.taskRepo.remove(task);
  }

  async countTemplateTasksByMilestone(milestone: number): Promise<number> {
    return this.taskRepo.count({ where: { userId: null as any, milestone } });
  }
}
