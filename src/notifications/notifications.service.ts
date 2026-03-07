import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification } from './entities/notification.entity';
import { NotificationType } from '../common/enums/notification-type.enum';

const MAX_NOTIFICATIONS_PER_USER = 200;
const READ_RETENTION_DAYS = 30;

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: object;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    const notification = this.notificationRepo.create(data);
    const saved = await this.notificationRepo.save(notification);

    // Enforce per-user cap: delete oldest beyond MAX_NOTIFICATIONS_PER_USER
    await this.enforceUserCap(data.userId);

    return saved;
  }

  async createForMultipleUsers(
    userIds: string[],
    data: Omit<CreateNotificationData, 'userId'>,
  ): Promise<void> {
    if (!userIds.length) return;
    const notifications = userIds.map((userId) =>
      this.notificationRepo.create({ ...data, userId }),
    );
    await this.notificationRepo.save(notifications);

    // Enforce cap for each affected user
    await Promise.all(userIds.map((id) => this.enforceUserCap(id)));
  }

  async getByUserId(userId: string, page: number, limit: number) {
    const [data, total] = await this.notificationRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepo.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const n = await this.notificationRepo.findOne({
      where: { id: notificationId, userId },
    });
    if (!n) throw new Error('Notification not found');
    n.read = true;
    return this.notificationRepo.save(n);
  }

  async markAllAsRead(userId: string): Promise<{ message: string }> {
    await this.notificationRepo.update({ userId, read: false }, { read: true });
    return { message: 'All notifications marked as read' };
  }

  // ── Private: cap oldest notifications beyond limit ────────────────────────

  private async enforceUserCap(userId: string): Promise<void> {
    const total = await this.notificationRepo.count({ where: { userId } });
    if (total <= MAX_NOTIFICATIONS_PER_USER) return;

    // Find the Nth newest notification (the cutoff point)
    const cutoffs = await this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: MAX_NOTIFICATIONS_PER_USER - 1,
      take: 1,
    });
    if (!cutoffs.length) return;
    const cutoff = cutoffs[0];

    await this.notificationRepo
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId', { userId })
      .andWhere('created_at < :cutoff', { cutoff: cutoff.createdAt })
      .execute();
  }

  // ── Scheduled cleanup: nightly at 2 AM ───────────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldReadNotifications(): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - READ_RETENTION_DAYS);

    const result = await this.notificationRepo.delete({
      read: true,
      createdAt: LessThan(cutoff),
    });

    this.logger.log(
      `[Cleanup] Deleted ${result.affected ?? 0} read notifications older than ${READ_RETENTION_DAYS} days`,
    );
  }
}
