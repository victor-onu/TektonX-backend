import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '../common/enums/user-role.enum'
import { PartnershipsService } from './partnerships.service'
import { CreatePartnershipInquiryDto } from './dto/create-partnership-inquiry.dto'

@ApiTags('partnerships')
@Controller('partnerships')
export class PartnershipsController {
  constructor(private readonly service: PartnershipsService) {}

  @Public()
  @Post()
  create(@Body() dto: CreatePartnershipInquiryDto) {
    return this.service.create(dto)
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.service.findAll()
  }
}
