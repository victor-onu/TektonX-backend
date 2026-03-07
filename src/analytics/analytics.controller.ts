import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('analytics')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('completion-rates')
  async getCompletionRates(): Promise<any[]> {
    return this.analyticsService.getCompletionRates();
  }

  @Get('dropout')
  async getDropoutData(): Promise<any[]> {
    return this.analyticsService.getDropoutData();
  }

  @Get('mentor-effectiveness')
  async getMentorEffectiveness(): Promise<any[]> {
    return this.analyticsService.getMentorEffectiveness();
  }

  @Get('export')
  async exportData(
    @Query('format') format: string,
    @Res() res: Response,
  ): Promise<void> {
    if (format === 'pdf') {
      const buffer = await this.analyticsService.exportPdf();
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="tektonx-analytics.pdf"',
        'Content-Length': buffer.length,
      });
      res.end(buffer);
    } else {
      const csv = await this.analyticsService.exportCsv();
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="tektonx-analytics.csv"',
      });
      res.end(csv);
    }
  }
}
