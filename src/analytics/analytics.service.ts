import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { MentorAssignment } from '../admin/entities/mentor-assignment.entity';
import { Message } from '../messages/entities/message.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';

interface TrackCompletion {
  track: string;
  milestone1: number;
  milestone2: number;
  milestone3: number;
  overall: number;
}

interface DropoutDataPoint {
  milestone: number;
  week: number;
  completedCount: number;
  templateCount: number;
}

interface MentorEffectiveness {
  mentorId: string;
  mentorName: string;
  track: string;
  menteeCount: number;
  avgMenteeProgress: number;
  messagesCount: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(MentorAssignment)
    private readonly assignmentRepo: Repository<MentorAssignment>,
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
  ) {}

  async getCompletionRates(): Promise<TrackCompletion[]> {
    const tracks = await this.userRepo
      .createQueryBuilder('u')
      .select('DISTINCT u.track', 'track')
      .where('u.role = :role', { role: UserRole.MENTEE })
      .getRawMany();

    const [m1Total, m2Total, m3Total] = await Promise.all([
      this.taskRepo.count({ where: { userId: null as any, milestone: 1 } }),
      this.taskRepo.count({ where: { userId: null as any, milestone: 2 } }),
      this.taskRepo.count({ where: { userId: null as any, milestone: 3 } }),
    ]);

    const results: TrackCompletion[] = [];
    for (const { track } of tracks) {
      const mentees = await this.userRepo.find({ where: { role: UserRole.MENTEE, track } });
      if (!mentees.length) continue;
      const avg = (arr: number[], total: number) =>
        total > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length / total) * 100 : 0;
      const m1 = avg(
        mentees.map(m => m.milestone1Completed),
        m1Total,
      );
      const m2 = avg(
        mentees.map(m => m.milestone2Completed),
        m2Total,
      );
      const m3 = avg(
        mentees.map(m => m.milestone3Completed),
        m3Total,
      );
      results.push({
        track,
        milestone1: m1,
        milestone2: m2,
        milestone3: m3,
        overall: (m1 + m2 + m3) / 3,
      });
    }
    return results;
  }

  async getDropoutData(): Promise<DropoutDataPoint[]> {
    const data: DropoutDataPoint[] = [];
    for (let milestone = 1; milestone <= 3; milestone++) {
      for (let week = 1; week <= 4; week++) {
        const templatesForWeek = await this.taskRepo.count({
          where: { userId: null as any, milestone, week },
        });
        const completedCount = await this.taskRepo.count({
          where: { milestone, week, completed: true },
        });
        data.push({ milestone, week, completedCount, templateCount: templatesForWeek });
      }
    }
    return data;
  }

  async exportCsv(): Promise<string> {
    const [completionRates, dropoutData, mentorEffectiveness] = await Promise.all([
      this.getCompletionRates(),
      this.getDropoutData(),
      this.getMentorEffectiveness(),
    ]);

    const lines: string[] = [];

    lines.push('TEKTONX ANALYTICS EXPORT');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    // Completion Rates
    lines.push('COMPLETION RATES BY TRACK');
    lines.push('Track,Milestone 1 (%),Milestone 2 (%),Milestone 3 (%),Overall (%)');
    for (const r of completionRates) {
      lines.push(
        `"${r.track}",${r.milestone1.toFixed(1)},${r.milestone2.toFixed(1)},${r.milestone3.toFixed(1)},${r.overall.toFixed(1)}`,
      );
    }
    lines.push('');

    // Dropout Data
    lines.push('DROPOUT ANALYSIS');
    lines.push('Milestone,Week,Completed Tasks,Template Tasks');
    for (const d of dropoutData) {
      lines.push(`${d.milestone},${d.week},${d.completedCount},${d.templateCount}`);
    }
    lines.push('');

    // Mentor Effectiveness
    lines.push('MENTOR EFFECTIVENESS');
    lines.push('Mentor,Track,Mentees,Avg Progress (%),Messages Sent');
    for (const m of mentorEffectiveness) {
      lines.push(
        `"${m.mentorName}","${m.track}",${m.menteeCount},${m.avgMenteeProgress.toFixed(1)},${m.messagesCount}`,
      );
    }

    return lines.join('\n');
  }

  async exportPdf(): Promise<Buffer> {
    const [completionRates, dropoutData, mentorEffectiveness] = await Promise.all([
      this.getCompletionRates(),
      this.getDropoutData(),
      this.getMentorEffectiveness(),
    ]);

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const primaryColor = '#7C3AED';
      const mutedColor = '#9CA3AF';
      const pageWidth = doc.page.width - 100; // margins on both sides

      // ── Title ──
      doc
        .fontSize(22)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('TEKTONX ANALYTICS REPORT', { align: 'center' });
      doc
        .fontSize(10)
        .fillColor(mutedColor)
        .font('Helvetica')
        .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(1.5);

      // ── Section 1: Completion Rates ──
      doc.fontSize(14).fillColor(primaryColor).font('Helvetica-Bold').text('COMPLETION RATES BY TRACK');
      doc.moveDown(0.4);

      if (completionRates.length === 0) {
        doc.fontSize(10).fillColor(mutedColor).font('Helvetica').text('No data available.');
      } else {
        const colWidths = [180, 70, 70, 70, 70];
        const headers = ['Track', 'M1 (%)', 'M2 (%)', 'M3 (%)', 'Overall (%)'];
        let x = 50;
        doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold');
        doc.rect(50, doc.y, pageWidth, 16).fill('#374151');
        const headerY = doc.y - 16 + 4;
        headers.forEach((h, i) => {
          doc.fillColor('#FFFFFF').text(h, x + 3, headerY, { width: colWidths[i], align: i === 0 ? 'left' : 'center' });
          x += colWidths[i];
        });
        doc.y = headerY + 16;

        completionRates.forEach((r, idx) => {
          const rowY = doc.y;
          doc.rect(50, rowY, pageWidth, 14).fill(idx % 2 === 0 ? '#F9FAFB' : '#F3F4F6');
          x = 50;
          const vals = [
            r.track,
            r.milestone1.toFixed(1),
            r.milestone2.toFixed(1),
            r.milestone3.toFixed(1),
            r.overall.toFixed(1),
          ];
          vals.forEach((v, i) => {
            doc.fontSize(9).fillColor('#111827').font('Helvetica').text(v, x + 3, rowY + 3, {
              width: colWidths[i] - 6,
              align: i === 0 ? 'left' : 'center',
            });
            x += colWidths[i];
          });
          doc.y = rowY + 14;
        });
      }
      doc.moveDown(1.5);

      // ── Section 2: Dropout Analysis ──
      doc.fontSize(14).fillColor(primaryColor).font('Helvetica-Bold').text('DROPOUT ANALYSIS');
      doc.moveDown(0.4);

      if (dropoutData.length === 0) {
        doc.fontSize(10).fillColor(mutedColor).font('Helvetica').text('No data available.');
      } else {
        const colWidths = [80, 60, 120, 120];
        const headers = ['Milestone', 'Week', 'Completed Tasks', 'Template Tasks'];
        let x = 50;
        doc.rect(50, doc.y, pageWidth, 16).fill('#374151');
        const headerY = doc.y - 16 + 4;
        headers.forEach((h, i) => {
          doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold').text(h, x + 3, headerY, { width: colWidths[i], align: 'center' });
          x += colWidths[i];
        });
        doc.y = headerY + 16;

        dropoutData.forEach((d, idx) => {
          const rowY = doc.y;
          doc.rect(50, rowY, pageWidth, 14).fill(idx % 2 === 0 ? '#F9FAFB' : '#F3F4F6');
          x = 50;
          [`M${d.milestone}`, String(d.week), String(d.completedCount), String(d.templateCount)].forEach((v, i) => {
            doc.fontSize(9).fillColor('#111827').font('Helvetica').text(v, x + 3, rowY + 3, { width: colWidths[i] - 6, align: 'center' });
            x += colWidths[i];
          });
          doc.y = rowY + 14;
        });
      }
      doc.moveDown(1.5);

      // ── Section 3: Mentor Effectiveness ──
      doc.fontSize(14).fillColor(primaryColor).font('Helvetica-Bold').text('MENTOR EFFECTIVENESS');
      doc.moveDown(0.4);

      if (mentorEffectiveness.length === 0) {
        doc.fontSize(10).fillColor(mutedColor).font('Helvetica').text('No data available.');
      } else {
        const colWidths = [130, 100, 60, 90, 90];
        const headers = ['Mentor', 'Track', 'Mentees', 'Avg Progress', 'Messages'];
        let x = 50;
        doc.rect(50, doc.y, pageWidth, 16).fill('#374151');
        const headerY = doc.y - 16 + 4;
        headers.forEach((h, i) => {
          doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold').text(h, x + 3, headerY, { width: colWidths[i], align: i === 0 ? 'left' : 'center' });
          x += colWidths[i];
        });
        doc.y = headerY + 16;

        mentorEffectiveness.forEach((m, idx) => {
          const rowY = doc.y;
          doc.rect(50, rowY, pageWidth, 14).fill(idx % 2 === 0 ? '#F9FAFB' : '#F3F4F6');
          x = 50;
          [m.mentorName, m.track, String(m.menteeCount), `${m.avgMenteeProgress.toFixed(1)}%`, String(m.messagesCount)].forEach((v, i) => {
            doc.fontSize(9).fillColor('#111827').font('Helvetica').text(v, x + 3, rowY + 3, { width: colWidths[i] - 6, align: i === 0 ? 'left' : 'center' });
            x += colWidths[i];
          });
          doc.y = rowY + 14;
        });
      }

      doc.end();
    });
  }

  async getMentorEffectiveness(): Promise<MentorEffectiveness[]> {
    const mentors = await this.userRepo.find({
      where: { role: UserRole.MENTOR, status: UserStatus.ACTIVE },
    });
    const results: MentorEffectiveness[] = [];
    for (const mentor of mentors) {
      const assignments = await this.assignmentRepo.find({
        where: { mentorId: mentor.id },
        relations: ['mentee'],
      });
      const mentees = assignments.map(a => a.mentee).filter(Boolean);
      const avgProgress =
        mentees.length > 0
          ? mentees.reduce(
              (sum, m) =>
                sum +
                (m.milestone1Completed + m.milestone2Completed + m.milestone3Completed) / 3,
              0,
            ) / mentees.length
          : 0;
      const msgCount = await this.messageRepo.count({ where: { senderId: mentor.id } });
      results.push({
        mentorId: mentor.id,
        mentorName: mentor.name,
        track: mentor.track,
        menteeCount: mentees.length,
        avgMenteeProgress: Math.round(avgProgress * 100) / 100,
        messagesCount: msgCount,
      });
    }
    return results.sort((a, b) => b.avgMenteeProgress - a.avgMenteeProgress);
  }
}
