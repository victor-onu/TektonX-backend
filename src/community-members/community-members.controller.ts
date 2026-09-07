import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CommunityMembersService } from './community-members.service';
import { CreateCommunityMemberDto } from './dto/create-community-member.dto';

@ApiTags('community-members')
@Controller('community-members')
export class CommunityMembersController {
  constructor(private readonly service: CommunityMembersService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateCommunityMemberDto) {
    return this.service.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Get('export')
  async export(@Res() res: Response) {
    const csv = await this.service.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="community-members.csv"',
    );
    res.status(HttpStatus.OK).send(csv);
  }
}
