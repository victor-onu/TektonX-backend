import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { MentorAssignment } from '../admin/entities/mentor-assignment.entity';
import { Task } from '../tasks/entities/task.entity';
import { MailModule } from '../mail/mail.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { WeeklyDigestService } from './weekly-digest.service';
import { WeeklyDigestController } from './weekly-digest.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, MentorAssignment, Task]),
    MailModule,
    CurriculumModule,
  ],
  controllers: [WeeklyDigestController],
  providers: [WeeklyDigestService],
})
export class WeeklyDigestModule {}
