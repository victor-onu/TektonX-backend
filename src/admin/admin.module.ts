import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AssignmentsController } from './assignments.controller';
import { MentorAssignment } from './entities/mentor-assignment.entity';
import { AuditLog } from '../audit-log/entities/audit-log.entity';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Announcement } from '../announcements/entities/announcement.entity';
import { MentorshipSession } from '../sessions/entities/session.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Signup } from '../signups/entities/signup.entity';
import { Message } from '../messages/entities/message.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MentorAssignment,
      AuditLog,
      User,
      Task,
      Announcement,
      MentorshipSession,
      Notification,
      Signup,
      Message,
    ]),
    NotificationsModule,
  ],
  controllers: [AdminController, AssignmentsController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
