import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import * as ExcelJS from 'exceljs';
import { AdminService } from './admin.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { User } from '../users/entities/user.entity';
import { RejectMentorDto } from './dto/reject-mentor.dto';
import { AssignMenteesDto } from './dto/assign-mentees.dto';
import { ChangeRoleDto } from './dto/change-role.dto';

async function parseXlsx(buffer: Buffer): Promise<{ name: string; email: string; track: string }[]> {
  const workbook = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);
  const sheet = workbook.worksheets[0];
  const dataRows: { name: string; email: string; track: string }[] = [];
  let rowCount = 0;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    rowCount++;
    if (rowCount > 100) return;
    const name = (row.getCell(1).text ?? '').trim();
    const email = (row.getCell(2).text ?? '').trim();
    const track = (row.getCell(3).text ?? '').trim();
    if (name && email && track) {
      dataRows.push({ name, email, track });
    }
  });
  if (rowCount > 100) {
    throw new BadRequestException('CSV file must not exceed 100 rows.');
  }
  return dataRows;
}

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

  // Applicants (Mentees)
  @Get('applicants')
  getApplicants() {
    return this.adminService.getApplicants();
  }

  @Patch('mentees/:id/status')
  updateMenteeStatus(
    @Param('id') id: string,
    @Body() body: { status: ApplicationStatus },
    @CurrentUser() admin: User,
  ) {
    return this.adminService.updateMenteeApplicationStatus(id, body.status, admin.id);
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

  // Invite
  @Post('invite')
  inviteMentee(
    @Body() dto: { name: string; email: string; track: string },
    @CurrentUser() admin: User,
  ) {
    return this.adminService.inviteMentee(dto, admin.id);
  }

  @Post('invite/bulk')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async inviteBulk(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() admin: User,
  ) {
    if (!file) throw new BadRequestException('No file provided.');
    const rows = await parseXlsx(file.buffer);
    return this.adminService.inviteMenteeBulk(rows, admin.id);
  }

  @Get('invite/sample-xlsx')
  async getSampleXlsx(@Res() res: Response) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Invites');

    sheet.columns = [
      { width: 25 },
      { width: 35 },
      { width: 45 },
    ];

    // Header row
    const headerRow = sheet.addRow(['name', 'email', 'track']);
    headerRow.font = { bold: true };

    // Note row
    const noteRow = sheet.addRow(['# Replace these rows with real data. Delete this row before uploading.', '', '']);
    noteRow.font = { italic: true, color: { argb: 'FF888888' } };

    // Example data rows
    sheet.addRow(['John Doe', 'john@example.com', 'Software Development (Frontend & Backend)']);
    sheet.addRow(['Jane Doe', 'jane@example.com', 'UI/UX Design']);
    sheet.addRow(['Alex Smith', 'alex@example.com', 'Mobile App Development']);
    sheet.addRow(['Sam Taylor', 'sam@example.com', 'Product/Project Management']);
    sheet.addRow(['Chris Lee', 'chris@example.com', 'Quality Assurance (QA)']);
    sheet.addRow(['Morgan Brown', 'morgan@example.com', 'Data (Analysis/Science)']);
    sheet.addRow(['Riley Green', 'riley@example.com', 'Cybersecurity']);
    sheet.addRow(['Jordan Blake', 'jordan@example.com', 'Web3']);

    // Dropdown validation for column C, rows 2–101
    for (let i = 2; i <= 101; i++) {
      sheet.getCell(`C${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"Software Development (Frontend & Backend),UI/UX Design,Mobile App Development,Product/Project Management,Quality Assurance (QA),Data (Analysis/Science),Cybersecurity,Web3"'],
        showErrorMessage: true,
        errorTitle: 'Invalid Track',
        error: 'Please select a valid track from the dropdown.',
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="tektonx-invite-template.xlsx"');
    res.send(Buffer.from(buffer));
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
