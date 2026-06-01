import { Controller, Post, Get, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { WeeklyDigestService } from './weekly-digest.service';

@ApiTags('Weekly Digest')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/weekly-digest')
export class WeeklyDigestController {
  constructor(private readonly digest: WeeklyDigestService) {}

  @Post('run')
  runNow(@Body() body: { week?: number }) {
    if (body?.week) return this.digest.runForWeek(body.week);
    return this.digest.runForCurrentWeek();
  }

  @Get('preview/mentee')
  previewMentee(@Query('track') track: string, @Query('week') week: string) {
    return this.digest.previewMentee(track, Number(week));
  }

  @Get('preview/mentor')
  previewMentor(@Query('week') week: string, @Query('tracks') tracks: string) {
    const trackList = tracks ? tracks.split(',').filter(Boolean) : [];
    return this.digest.previewMentor(Number(week), trackList);
  }
}
