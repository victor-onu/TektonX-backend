import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { MentorAssignment } from '../admin/entities/mentor-assignment.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(MentorAssignment)
    private readonly assignmentRepo: Repository<MentorAssignment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getConversations(userId: string) {
    const messages = await this.messageRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .leftJoinAndSelect('m.receiver', 'receiver')
      .where('m.senderId = :userId OR m.receiverId = :userId', { userId })
      .orderBy('m.createdAt', 'DESC')
      .getMany();

    const convMap = new Map<string, any>();
    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, {
          partnerId,
          partnerName: partner?.name ?? '',
          partnerTrack: partner?.track ?? '',
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        });
      }
      if (msg.receiverId === userId && !msg.read) {
        const conv = convMap.get(partnerId);
        conv.unreadCount++;
      }
    }
    return Array.from(convMap.values());
  }

  async getMessages(userId: string, partnerId: string): Promise<Message[]> {
    return this.messageRepo
      .createQueryBuilder('m')
      .where(
        '(m.senderId = :userId AND m.receiverId = :partnerId) OR (m.senderId = :partnerId AND m.receiverId = :userId)',
        { userId, partnerId },
      )
      .orderBy('m.createdAt', 'ASC')
      .getMany();
  }

  async sendMessage(senderId: string, dto: SendMessageDto): Promise<Message> {
    const assignment = await this.assignmentRepo.findOne({
      where: [
        { mentorId: senderId, menteeId: dto.receiverId },
        { mentorId: dto.receiverId, menteeId: senderId },
      ],
    });
    if (!assignment) {
      throw new ForbiddenException('You can only message your assigned mentor or mentees.');
    }

    const message = this.messageRepo.create({
      senderId,
      receiverId: dto.receiverId,
      content: dto.content,
      fileUrl: dto.fileUrl,
    });
    const saved = await this.messageRepo.save(message);

    await this.notificationsService.create({
      userId: dto.receiverId,
      type: NotificationType.MESSAGE,
      title: 'New Message',
      message: 'You have a new message.',
    });

    return saved;
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.receiverId !== userId) throw new ForbiddenException('Cannot mark this message as read');
    message.read = true;
    return this.messageRepo.save(message);
  }

  async markConversationAsRead(userId: string, partnerId: string): Promise<{ count: number }> {
    const result = await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ read: true })
      .where('senderId = :partnerId AND receiverId = :userId AND read = false', { partnerId, userId })
      .execute();
    return { count: result.affected ?? 0 };
  }
}
