import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadsService, FILE_SIZE_LIMITS } from './uploads.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Public()
  @Post('profile-photo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: FILE_SIZE_LIMITS.image } }))
  async uploadProfilePhoto(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
    const url = await this.uploadsService.uploadProfilePhoto(file);
    return { url };
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: FILE_SIZE_LIMITS.document } }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Body('taskId') taskId?: string,
  ) {
    return this.uploadsService.uploadFile(file, user.id, taskId);
  }

  @Get()
  getUploads(@Query('taskId') taskId?: string, @CurrentUser() user: User = {} as User) {
    if (taskId) return this.uploadsService.getByTaskId(taskId);
    return this.uploadsService.getByUserId(user.id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.uploadsService.getById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.uploadsService.deleteUpload(
      id,
      user.id,
      (user.role as string) === UserRole.ADMIN,
    );
  }
}
