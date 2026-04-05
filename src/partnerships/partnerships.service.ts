import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PartnershipInquiry } from './entities/partnership-inquiry.entity'
import { CreatePartnershipInquiryDto } from './dto/create-partnership-inquiry.dto'
import { MailService } from '../mail/mail.service'

@Injectable()
export class PartnershipsService {
  constructor(
    @InjectRepository(PartnershipInquiry)
    private readonly repo: Repository<PartnershipInquiry>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreatePartnershipInquiryDto): Promise<{ message: string }> {
    const inquiry = this.repo.create({
      companyName: dto.companyName,
      contactName: dto.contactName,
      email: dto.email,
      phone: dto.phone ?? null,
      partnershipType: dto.partnershipType,
      message: dto.message ?? null,
    })
    await this.repo.save(inquiry)
    this.mailService.sendPartnershipConfirmation(dto.email, dto.contactName, dto.companyName).catch(() => {})
    this.mailService.sendPartnershipAdminNotification(dto.companyName, dto.contactName, dto.email, dto.partnershipType, dto.message).catch(() => {})
    return { message: 'Thank you for your interest! We will be in touch within 3–5 business days.' }
  }

  async findAll(): Promise<PartnershipInquiry[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } })
  }
}
