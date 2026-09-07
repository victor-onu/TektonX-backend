import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from '../users/entities/user.entity';
import { MentorAssignment } from '../admin/entities/mentor-assignment.entity';
import { Task } from '../tasks/entities/task.entity';
import { MailService } from '../mail/mail.service';
import { CurriculumService } from '../curriculum/curriculum.service';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import {
  MENTEE_INTROS,
  MENTEE_OUTROS,
  MENTOR_INTROS,
  MENTOR_OUTROS,
  pickByWeek,
} from '../curriculum/data/variations.data';

export interface DigestRunResult {
  week: number | null;
  menteesSent: number;
  menteesFailed: number;
  mentorsSent: number;
  mentorsFailed: number;
  skipped: string[];
}

@Injectable()
export class WeeklyDigestService {
  private readonly logger = new Logger(WeeklyDigestService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(MentorAssignment)
    private readonly assignmentRepo: Repository<MentorAssignment>,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    private readonly mailService: MailService,
    private readonly curriculum: CurriculumService,
  ) {}

  @Cron('0 9 * * 1', { timeZone: 'Africa/Lagos' })
  async runScheduled(): Promise<void> {
    this.logger.log('[CRON] Weekly digest started');
    try {
      const result = await this.runForCurrentWeek();
      this.logger.log(
        `[CRON] Weekly digest complete — week=${result.week}, mentees sent=${result.menteesSent}, mentors sent=${result.mentorsSent}`,
      );
    } catch (err: any) {
      this.logger.error(`[CRON] Weekly digest failed: ${err?.message}`);
    }
  }

  async runForCurrentWeek(): Promise<DigestRunResult> {
    const week = this.curriculum.getCurrentWeekForCohort(
      this.curriculum.getCohortStart(),
    );
    if (week === null) {
      return {
        week: null,
        menteesSent: 0,
        menteesFailed: 0,
        mentorsSent: 0,
        mentorsFailed: 0,
        skipped: ['Cohort has not started yet or has ended.'],
      };
    }
    return this.runForWeek(week);
  }

  async runForWeek(week: number): Promise<DigestRunResult> {
    if (week < 1 || week > 12) {
      throw new BadRequestException('Week must be between 1 and 12');
    }

    const skipped: string[] = [];
    let menteesSent = 0;
    let menteesFailed = 0;
    let mentorsSent = 0;
    let mentorsFailed = 0;

    // ── MENTEES ────────────────────────────────────────────────────────────────
    const mentees = await this.userRepo.find({
      where: {
        role: UserRole.MENTEE,
        status: UserStatus.ACTIVE,
        applicationStatus: ApplicationStatus.ENROLLED,
      },
    });

    for (const mentee of mentees) {
      const bundle = this.curriculum.buildBundle(mentee.track, week);
      if (!bundle.weekContent) {
        skipped.push(
          `Mentee ${mentee.email}: no curriculum for track "${mentee.track}"`,
        );
        continue;
      }
      const milestoneCompleted = this.getMilestoneCompleted(
        mentee,
        bundle.milestone,
      );
      try {
        await this.mailService.sendWeeklyDigestMentee(mentee.email, {
          name: mentee.name.split(' ')[0],
          track: mentee.track,
          week: bundle.week,
          totalWeeks: bundle.totalWeeks,
          milestone: bundle.milestone,
          weeksRemaining: bundle.weeksRemaining,
          weekContent: bundle.weekContent,
          programEvent: bundle.programEvent,
          milestoneCompleted,
          milestoneCompletedSingular: milestoneCompleted === 1,
          intro: pickByWeek(MENTEE_INTROS, week)
            .replace('{week}', String(week))
            .replace('{track}', mentee.track),
          outro: pickByWeek(MENTEE_OUTROS, week),
        });
        menteesSent++;
      } catch {
        menteesFailed++;
      }
    }

    // ── MENTORS ────────────────────────────────────────────────────────────────
    const assignments = await this.assignmentRepo.find({
      relations: ['mentor', 'mentee'],
    });
    const mentorMap = new Map<string, { mentor: User; mentees: User[] }>();
    for (const a of assignments) {
      if (!a.mentor || !a.mentee) continue;
      if (a.mentor.status !== UserStatus.ACTIVE) continue;
      if (a.mentee.status !== UserStatus.ACTIVE) continue;
      if (a.mentee.applicationStatus !== ApplicationStatus.ENROLLED) continue;
      const entry = mentorMap.get(a.mentor.id) ?? {
        mentor: a.mentor,
        mentees: [],
      };
      entry.mentees.push(a.mentee);
      mentorMap.set(a.mentor.id, entry);
    }

    for (const { mentor, mentees: menteeList } of mentorMap.values()) {
      const tracks = Array.from(new Set(menteeList.map((m) => m.track)));
      const trackContent = tracks
        .map((track) => {
          const c = this.curriculum.getWeekContent(track, week);
          return c ? { track, ...c } : null;
        })
        .filter(
          (
            x,
          ): x is { track: string } & ReturnType<
            CurriculumService['getWeekContent']
          > &
            object => x !== null,
        );

      const programEvent = this.curriculum.getProgramEventForWeek(week);
      const milestone = this.curriculum.buildBundle(
        tracks[0] ?? '',
        week,
      ).milestone;

      const singular = menteeList.length === 1;
      const mentorIntro = pickByWeek(MENTOR_INTROS, week)
        .replace('{week}', String(week))
        .replaceAll('{plural}', singular ? '' : 's')
        .replaceAll('{verb}', singular ? 'is' : 'are');
      const mentorOutro = pickByWeek(MENTOR_OUTROS, week).replaceAll(
        '{plural}',
        singular ? '' : 's',
      );

      try {
        await this.mailService.sendWeeklyDigestMentor(mentor.email, {
          name: mentor.name.split(' ')[0],
          week,
          totalWeeks: 12,
          weeksRemaining: Math.max(0, 12 - week),
          milestone,
          mentees: menteeList.map((m) => ({ name: m.name, track: m.track })),
          menteeCountSingular: singular,
          trackContent,
          programEvent,
          intro: mentorIntro,
          outro: mentorOutro,
        });
        mentorsSent++;
      } catch {
        mentorsFailed++;
      }
    }

    return {
      week,
      menteesSent,
      menteesFailed,
      mentorsSent,
      mentorsFailed,
      skipped,
    };
  }

  private getMilestoneCompleted(
    mentee: User,
    milestone: 1 | 2 | 3 | null,
  ): number {
    if (!milestone) return 0;
    if (milestone === 1) return mentee.milestone1Completed ?? 0;
    if (milestone === 2) return mentee.milestone2Completed ?? 0;
    return mentee.milestone3Completed ?? 0;
  }

  // ── Preview (no email sent) ─────────────────────────────────────────────────
  async previewMentee(track: string, week: number) {
    if (week < 1 || week > 12)
      throw new BadRequestException('Week must be between 1 and 12');
    const bundle = this.curriculum.buildBundle(track, week);
    if (!bundle.weekContent)
      throw new BadRequestException(`No curriculum for track "${track}"`);
    return {
      ...bundle,
      track,
      name: 'Friend',
      milestoneCompleted: 0,
      milestoneCompletedSingular: false,
      intro: pickByWeek(MENTEE_INTROS, week)
        .replace('{week}', String(week))
        .replace('{track}', track),
      outro: pickByWeek(MENTEE_OUTROS, week),
    };
  }

  async previewMentor(week: number, tracks: string[]) {
    if (week < 1 || week > 12)
      throw new BadRequestException('Week must be between 1 and 12');
    const trackContent = tracks
      .map((track) => {
        const c = this.curriculum.getWeekContent(track, week);
        return c ? { track, ...c } : null;
      })
      .filter(
        (
          x,
        ): x is { track: string } & NonNullable<
          ReturnType<CurriculumService['getWeekContent']>
        > => x !== null,
      );
    const programEvent = this.curriculum.getProgramEventForWeek(week);
    const milestone = this.curriculum.buildBundle(
      tracks[0] ?? '',
      week,
    ).milestone;
    return {
      name: 'Friend',
      week,
      totalWeeks: 12,
      weeksRemaining: Math.max(0, 12 - week),
      milestone,
      mentees: [],
      menteeCountSingular: false,
      trackContent,
      programEvent,
      intro: pickByWeek(MENTOR_INTROS, week)
        .replace('{week}', String(week))
        .replaceAll('{plural}', 's')
        .replaceAll('{verb}', 'are'),
      outro: pickByWeek(MENTOR_OUTROS, week).replaceAll('{plural}', 's'),
    };
  }
}
