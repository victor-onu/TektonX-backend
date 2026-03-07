import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { RejectMentorDto } from './dto/reject-mentor.dto';
import { AssignMenteesDto } from './dto/assign-mentees.dto';
import { ChangeRoleDto } from './dto/change-role.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Mentor Approval
  @Get('mentors/pending')
  getPendingMentors() {
    return this.adminService.getPendingMentors();
  }

  @Put('mentors/:id/approve')
  approveMentor(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adminService.approveMentor(id, user.id);
  }

  @Put('mentors/:id/reject')
  rejectMentor(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: RejectMentorDto,
  ) {
    return this.adminService.rejectMentor(id, user.id, dto);
  }

  // Assignments
  @Get('assignments')
  getAssignments() {
    return this.adminService.getAssignments();
  }

  @Get('assignments/unassigned')
  getUnassignedMentees(@Query('track') track?: string) {
    return this.adminService.getUnassignedMentees(track);
  }

  @Post('assignments')
  assignMentees(@Body() dto: AssignMenteesDto, @CurrentUser() user: User) {
    return this.adminService.assignMentees(dto, user.id);
  }

  @Delete('assignments/:id')
  unassignMentee(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adminService.unassignMentee(id, user.id);
  }

  // Stats & Users
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getAllUsers(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('track') track?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.adminService.getAllUsers({
      role,
      status,
      track,
      search,
      page: +page,
      limit: +limit,
    });
  }

  @Put('users/:id/role')
  changeUserRole(
    @Param('id') id: string,
    @Body() dto: ChangeRoleDto,
    @CurrentUser() user: User,
  ) {
    return this.adminService.changeUserRole(id, dto.role, user.id);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adminService.deleteUser(id, user.id);
  }

  // Template Tasks
  @Get('tasks')
  getTemplateTasks() {
    return this.adminService['taskRepo'].find({
      where: { userId: null as any },
      order: { milestone: 'ASC', week: 'ASC' },
    });
  }

  @Post('tasks')
  createTemplateTask(@Body() dto: any, @CurrentUser() user: User) {
    return this.adminService.createTemplateTask(dto, user.id);
  }

  @Put('tasks/:id')
  updateTemplateTask(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: User) {
    return this.adminService.updateTemplateTask(id, dto, user.id);
  }

  @Delete('tasks/:id')
  deleteTemplateTask(@Param('id') id: string, @CurrentUser() user: User) {
    return this.adminService.deleteTemplateTask(id, user.id);
  }

  // Signups
  @Get('signups')
  getSignups(
    @Query('track') track?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.adminService.getSignups({ track, search, page: +page, limit: +limit });
  }

  @Get('signups/export')
  async exportSignups(@Res() res: Response) {
    const csv = await this.adminService.exportSignupsCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="signups.csv"');
    res.status(HttpStatus.OK).send(csv);
  }

  // Audit Log
  @Get('audit-log')
  getAuditLog(
    @Query('action') action?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.adminService.getAuditLog({ action, page: +page, limit: +limit });
  }
}
