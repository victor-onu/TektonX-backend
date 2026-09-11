import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { EventsService } from './events.service';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Public()
  @Post(':slug/register')
  register(
    @Param('slug') slug: string,
    @Body() dto: CreateEventRegistrationDto,
  ) {
    return this.service.register(slug, dto);
  }

  @Roles(UserRole.ADMIN)
  @Get(':slug/registrations')
  findRegistrations(@Param('slug') slug: string) {
    return this.service.findRegistrations(slug);
  }

  @Roles(UserRole.ADMIN)
  @Get(':slug/registrations/export')
  async export(@Param('slug') slug: string, @Res() res: Response) {
    const csv = await this.service.exportRegistrationsCsv(slug);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${slug}-registrations.csv"`,
    );
    res.status(HttpStatus.OK).send(csv);
  }
}
