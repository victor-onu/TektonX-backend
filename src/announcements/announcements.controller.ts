import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { UploadsService, FILE_SIZE_LIMITS } from '../uploads/uploads.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@ApiTags('announcements')
@ApiBearerAuth()
@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Public()
  @Get()
  getAll() {
    return this.announcementsService.getAll();
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(dto, user.id);
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.announcementsService.delete(id);
  }

  // Upload a flier image — returns { url } for the frontend to attach to the announcement
  @Roles(UserRole.ADMIN)
  @Post('upload-flier')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: FILE_SIZE_LIMITS.flier } }))
  async uploadFlier(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('No file provided.');
    const url = await this.uploadsService.uploadFlier(file);
    return { url };
  }
}
