import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PartnershipInquiry } from './entities/partnership-inquiry.entity'
import { PartnershipsService } from './partnerships.service'
import { PartnershipsController } from './partnerships.controller'
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [TypeOrmModule.forFeature([PartnershipInquiry]), MailModule],
  controllers: [PartnershipsController],
  providers: [PartnershipsService],
})
export class PartnershipsModule {}
