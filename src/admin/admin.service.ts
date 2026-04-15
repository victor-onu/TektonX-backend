import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { MentorAssignment } from './entities/mentor-assignment.entity';
import { AuditLog } from '../audit-log/entities/audit-log.entity';
import { Task } from '../tasks/entities/task.entity';
import { Announcement } from '../announcements/entities/announcement.entity';
import { MentorshipSession } from '../sessions/entities/session.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Signup } from '../signups/entities/signup.entity';
import { Message } from '../messages/entities/message.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { NotificationType } from '../common/enums/notification-type.enum';
import { AssignMenteesDto } from './dto/assign-mentees.dto';
import { RejectMentorDto } from './dto/reject-mentor.dto';

const VALID_TRACKS = [
  'Software Development (Frontend & Backend)',
  'UI/UX Design',
  'Mobile App Development',
  'Product/Project Management',
  'Quality Assurance (QA)',
  'Data (Analysis/Science)',
  'Cybersecurity',
  'Web3',
];

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(MentorAssignment)
    private readonly assignmentRepo: Repository<MentorAssignment>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
    @InjectRepository(MentorshipSession)
    private readonly sessionRepo: Repository<MentorshipSession>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(Signup) private readonly signupRepo: Repository<Signup>,
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  private async auditLog(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    details?: object,
  ) {
    const entry = this.auditRepo.create({ adminId, action, targetType, targetId, details });
    await this.auditRepo.save(entry);
  }

  // ── Mentor Approval ──────────────────────────────────────────────────────────

  async getPendingMentors(): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.MENTOR, applicationStatus: ApplicationStatus.PENDING_APPROVAL },
      order: { createdAt: 'ASC' },
    });
  }

  async approveMentor(mentorId: string, adminId: string): Promise<User> {
    const mentor = await this.userRepo.findOne({ where: { id: mentorId } });
    if (!mentor) throw new NotFoundException('Mentor not found');
    if (mentor.role !== UserRole.MENTOR || mentor.applicationStatus !== ApplicationStatus.PENDING_APPROVAL) {
      throw new BadRequestException('User is not a pending mentor');
    }
    mentor.status = UserStatus.ACTIVE;
    mentor.applicationStatus = ApplicationStatus.APPROVED;
    await this.userRepo.save(mentor);
    await this.auditLog(adminId, 'mentor_approved', 'user', mentorId, {
      mentorName: mentor.name,
      mentorEmail: mentor.email,
    });
    await this.notificationsService.create({
      userId: mentorId,
      type: NotificationType.APPROVAL,
      title: 'Application Approved',
      message: 'Congratulations! Your mentor application has been approved.',
    });
    this.logger.log(`Mentor ${mentor.email} approved by admin ${adminId}`);
    this.mailService.sendMentorApproved(mentor.email, mentor.name).catch(() => {});
    return mentor;
  }

  async rejectMentor(mentorId: string, adminId: string, dto: RejectMentorDto): Promise<User> {
    const mentor = await this.userRepo.findOne({ where: { id: mentorId } });
    if (!mentor) throw new NotFoundException('Mentor not found');
    if (mentor.role !== UserRole.MENTOR) throw new BadRequestException('User is not a mentor');
    mentor.status = UserStatus.INACTIVE;
    mentor.applicationStatus = ApplicationStatus.REJECTED;
    await this.userRepo.save(mentor);
    await this.auditLog(adminId, 'mentor_rejected', 'user', mentorId, {
      mentorName: mentor.name,
      reason: dto.reason,
    });
    await this.notificationsService.create({
      userId: mentorId,
      type: NotificationType.APPROVAL,
      title: 'Application Not Approved',
      message: dto.reason
        ? `Your application was not approved. Reason: ${dto.reason}`
        : 'Your mentor application was not approved at this time.',
    });
    this.mailService.sendMentorRejected(mentor.email, mentor.name, dto.reason).catch(() => {});
    return mentor;
  }

  // ── Assignments ──────────────────────────────────────────────────────────────

  async getAssignments() {
    return this.assignmentRepo.find({
      relations: ['mentor', 'mentee', 'admin'],
      order: { assignedAt: 'DESC' },
    });
  }

  async getUnassignedMentees(track?: string) {
    const assignedMenteeIds = (
      await this.assignmentRepo.find({ select: ['menteeId'] })
    ).map(a => a.menteeId);

    const qb = this.userRepo
      .createQueryBuilder('u')
      .where('u.role = :role', { role: UserRole.MENTEE })
      .andWhere('u.applicationStatus = :appStatus', { appStatus: ApplicationStatus.APPROVED });

    if (assignedMenteeIds.length > 0) {
      qb.andWhere('u.id NOT IN (:...ids)', { ids: assignedMenteeIds });
    }
    if (track) qb.andWhere('u.track = :track', { track });
    return qb.getMany();
  }

  async assignMentees(dto: AssignMenteesDto, adminId: string) {
    const mentor = await this.userRepo.findOne({ where: { id: dto.mentorId } });
    if (!mentor) throw new NotFoundException('Mentor not found');
    if (
      mentor.role !== UserRole.MENTOR ||
      mentor.status !== UserStatus.ACTIVE ||
      mentor.applicationStatus !== ApplicationStatus.APPROVED
    ) {
      throw new BadRequestException('Mentor is not approved');
    }

    const assignments: MentorAssignment[] = [];
    const assignedMentees: { name: string; track: string }[] = [];

    for (const menteeId of dto.menteeIds) {
      const mentee = await this.userRepo.findOne({ where: { id: menteeId } });
      if (!mentee) throw new NotFoundException(`Mentee ${menteeId} not found`);
      const existing = await this.assignmentRepo.findOne({ where: { menteeId } });
      if (existing) {
        existing.mentorId = dto.mentorId;
        existing.assignedBy = adminId;
        if (dto.cohortId !== undefined) existing.cohortId = dto.cohortId ?? null;
        assignments.push(await this.assignmentRepo.save(existing));
      } else {
        const a = this.assignmentRepo.create({
          mentorId: dto.mentorId,
          menteeId,
          assignedBy: adminId,
          cohortId: dto.cohortId ?? null,
        });
        assignments.push(await this.assignmentRepo.save(a));
      }
      if (dto.cohortId) {
        await this.userRepo.update(menteeId, { cohortId: dto.cohortId });
      }
      // Update mentee status to ACTIVE and applicationStatus to ENROLLED
      mentee.status = UserStatus.ACTIVE;
      mentee.applicationStatus = ApplicationStatus.ENROLLED;
      await this.userRepo.save(mentee);

      await this.notificationsService.create({
        userId: menteeId,
        type: NotificationType.ASSIGNMENT,
        title: 'Mentor Assigned',
        message: `You have been assigned a mentor: ${mentor.name}`,
      });
      this.mailService.sendMenteeAssigned(mentee.email, mentee.name, mentor.name, mentor.track).catch(() => {});
      assignedMentees.push({ name: mentee.name, track: mentee.track });
    }
    await this.notificationsService.create({
      userId: dto.mentorId,
      type: NotificationType.ASSIGNMENT,
      title: 'New Mentees Assigned',
      message: `${dto.menteeIds.length} new mentee(s) have been assigned to you.`,
    });
    this.mailService.sendMentorNewMentees(mentor.email, mentor.name, assignedMentees).catch(() => {});
    await this.auditLog(adminId, 'mentee_assigned', 'mentor_assignment', dto.mentorId, {
      menteeCount: dto.menteeIds.length,
    });
    return assignments;
  }

  async unassignMentee(assignmentId: string, adminId: string) {
    const assignment = await this.assignmentRepo.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.assignmentRepo.remove(assignment);
    await this.auditLog(adminId, 'mentee_unassigned', 'mentor_assignment', assignmentId, {});
    return { message: 'Mentee unassigned successfully' };
  }

  // ── Stats ─────────────────────────────────────────────────────────────────────

  async getStats() {
    const [
      totalMentees,
      totalMentors,
      totalAdmins,
      pendingMentors,
      assignedMentees,
      totalTemplateTasks,
      totalAnnouncements,
      totalSessions,
    ] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.MENTEE } }),
      this.userRepo.count({ where: { role: UserRole.MENTOR } }),
      this.userRepo.count({ where: { role: UserRole.ADMIN } }),
      this.userRepo.count({ where: { role: UserRole.MENTOR, applicationStatus: ApplicationStatus.PENDING_APPROVAL } }),
      this.assignmentRepo.count(),
      this.taskRepo.count({ where: { userId: null as any } }),
      this.announcementRepo.count(),
      this.sessionRepo.count(),
    ]);

    return {
      totalUsers: totalMentees + totalMentors + totalAdmins,
      totalMentees,
      totalMentors,
      totalAdmins,
      pendingMentors,
      assignedMentees,
      unassignedMentees: totalMentees - assignedMentees,
      totalTasks: totalTemplateTasks,
      completedTasks: 0,
      totalResources: 0,
      totalAnnouncements,
      totalSessions,
    };
  }

  async getAllUsers(filters: {
    role?: string;
    status?: string;
    track?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const { role, status, track, search, page, limit } = filters;
    const qb = this.userRepo.createQueryBuilder('u');
    if (role) qb.andWhere('u.role = :role', { role });
    if (status) qb.andWhere('u.status = :status', { status });
    if (track) qb.andWhere('u.track = :track', { track });
    if (search) {
      qb.andWhere('(u.name ILIKE :search OR u.email ILIKE :search)', { search: `%${search}%` });
    }
    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('u.createdAt', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async changeUserRole(userId: string, newRole: UserRole, adminId: string): Promise<User> {
    if (userId === adminId) throw new BadRequestException('Cannot change your own role');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.role = newRole;
    if (newRole === UserRole.MENTOR) user.status = UserStatus.ACTIVE;
    await this.userRepo.save(user);
    await this.auditLog(adminId, 'role_changed', 'user', userId, { newRole });
    return user;
  }

  async deleteUser(userId: string, adminId: string) {
    if (userId === adminId) throw new BadRequestException('Cannot delete your own account');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
    await this.auditLog(adminId, 'user_deleted', 'user', userId, { email: user.email });
    return { message: 'User deleted' };
  }

  // ── Mentee Application Status ─────────────────────────────────────────────────

  async getApplicants(): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.MENTEE },
      order: { createdAt: 'DESC' },
    });
  }

  async updateMenteeApplicationStatus(
    menteeId: string,
    newStatus: ApplicationStatus,
    adminId: string,
  ): Promise<User> {
    const mentee = await this.userRepo.findOne({ where: { id: menteeId } });
    if (!mentee) throw new NotFoundException('Mentee not found');
    if (mentee.role !== UserRole.MENTEE) throw new BadRequestException('User is not a mentee');
    mentee.applicationStatus = newStatus;
    await this.userRepo.save(mentee);
    await this.auditLog(adminId, 'mentee_status_updated', 'user', menteeId, { newStatus });
    if (newStatus === ApplicationStatus.APPROVED) {
      this.mailService.sendMenteeApproved(mentee.email, mentee.name).catch(() => {});
    }
    return mentee;
  }

  // ── Invite System ─────────────────────────────────────────────────────────────

  async inviteMentee(
    dto: { name: string; email: string; track: string },
    adminId: string,
  ): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const crypto = await import('crypto');
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      track: dto.track,
      role: UserRole.MENTEE,
      status: UserStatus.INACTIVE,
      applicationStatus: ApplicationStatus.APPROVED,
      passwordHash: '',
      inviteToken,
      inviteTokenExpiry,
      invitedAt: new Date(),
    });
    await this.userRepo.save(user);

    const activateUrl = `${process.env.FRONTEND_URL?.split(',')[0].trim() ?? 'http://localhost:5173'}/auth/activate?token=${inviteToken}`;
    this.mailService.sendInvite(dto.email, dto.name, activateUrl).catch(() => {});

    await this.auditLog(adminId, 'mentee_invited', 'user', user.id, { email: dto.email });
    return user;
  }

  async inviteMenteeBulk(
    rows: { name: string; email: string; track: string }[],
    adminId: string,
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of rows) {
      if (!VALID_TRACKS.includes(row.track)) {
        failed++;
        errors.push(`${row.email}: Invalid track "${row.track}". Must be one of: ${VALID_TRACKS.join(' | ')}`);
        continue;
      }
      try {
        await this.inviteMentee(row, adminId);
        sent++;
      } catch (err: any) {
        failed++;
        errors.push(`${row.email}: ${err?.message ?? 'Unknown error'}`);
      }
    }
    return { sent, failed, errors };
  }

  // ── Template Tasks ────────────────────────────────────────────────────────────

  async createTemplateTask(dto: any, adminId: string) {
    const task = this.taskRepo.create({ ...dto, userId: null });
    const saved = (await this.taskRepo.save(task)) as unknown as Task;
    await this.auditLog(adminId, 'task_created', 'task', saved.id, { title: saved.title });
    return saved;
  }

  async updateTemplateTask(id: string, dto: any, adminId: string) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    Object.assign(task, dto);
    const saved = await this.taskRepo.save(task);
    await this.auditLog(adminId, 'task_updated', 'task', id, {});
    return saved;
  }

  async deleteTemplateTask(id: string, adminId: string) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    await this.taskRepo.remove(task);
    await this.auditLog(adminId, 'task_deleted', 'task', id, {});
    return { message: 'Task deleted' };
  }

  // ── Signups ───────────────────────────────────────────────────────────────────

  async getSignups(filters: {
    track?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const { track, search, page, limit } = filters;
    const qb = this.signupRepo.createQueryBuilder('s');
    if (track) qb.andWhere('s.track = :track', { track });
    if (search) {
      qb.andWhere(
        '(s.name ILIKE :search OR s.email ILIKE :search OR s.whatsapp ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('s.createdAt', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async exportSignupsCsv(): Promise<string> {
    const signups = await this.signupRepo.find({ order: { createdAt: 'DESC' } });
    const header = 'id,name,email,whatsapp,track,experienceLevel,createdAt\n';
    const rows = signups
      .map(
        s =>
          `${s.id},"${s.name}","${s.email}","${s.whatsapp ?? ''}","${s.track}","${s.experienceLevel}","${s.createdAt.toISOString()}"`,
      )
      .join('\n');
    return header + rows;
  }

  async getMyAssignment(userId: string, role: UserRole) {
    if (role === UserRole.MENTEE) {
      return this.assignmentRepo.findOne({
        where: { menteeId: userId },
        relations: ['mentor'],
      });
    }
    if (role === UserRole.MENTOR) {
      return this.assignmentRepo.find({
        where: { mentorId: userId },
        relations: ['mentee'],
      });
    }
    return null;
  }

  async getAuditLog(filters: { action?: string; page: number; limit: number }) {
    const { action, page, limit } = filters;
    const qb = this.auditRepo.createQueryBuilder('a').leftJoinAndSelect('a.admin', 'admin');
    if (action) qb.andWhere('a.action = :action', { action });
    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('a.createdAt', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
