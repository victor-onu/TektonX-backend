import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { EventsService } from './events.service';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { EmailRegistrantsDto } from './dto/email-registrants.dto';

// Both routes below are shared with UserRole.COMMUNITY_MANAGER on purpose —
// this is the ONLY place that role appears in @Roles() anywhere in the app,
// which is what actually keeps it scoped to events/registrants and nothing
// else (mentee/mentor management, cohorts, the general broadcast feature,
// etc. all stay UserRole.ADMIN-only, untouched).
const EVENTS_ADMIN_ROLES = [UserRole.ADMIN, UserRole.COMMUNITY_MANAGER];

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Roles(...EVENTS_ADMIN_ROLES)
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

  @Roles(...EVENTS_ADMIN_ROLES)
  @Get(':slug/registrations')
  findRegistrations(@Param('slug') slug: string) {
    return this.service.findRegistrations(slug);
  }

  @Roles(...EVENTS_ADMIN_ROLES)
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

  @Roles(...EVENTS_ADMIN_ROLES)
  @Post(':slug/registrations/email')
  @UseInterceptors(
    FilesInterceptor('attachments', 5, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file, matches FILE_SIZE_LIMITS.document
    }),
  )
  emailRegistrants(
    @Param('slug') slug: string,
    @Body() dto: EmailRegistrantsDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    return this.service.emailRegistrants(slug, dto, files, user.id);
  }
}
