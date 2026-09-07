import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityMember } from './entities/community-member.entity';
import { CommunityMembersService } from './community-members.service';
import { CommunityMembersController } from './community-members.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityMember]), MailModule],
  controllers: [CommunityMembersController],
  providers: [CommunityMembersService],
})
export class CommunityMembersModule {}
