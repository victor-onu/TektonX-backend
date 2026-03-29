import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  private get frontendUrl(): string {
    const raw = this.config.get<string>('FRONTEND_URL', 'http://localhost:5173');
    // If multiple origins are configured (comma-separated), use the first one
    return raw.split(',')[0].trim();
  }

  private get year(): number {
    return new Date().getFullYear();
  }

  private async send(
    to: string,
    subject: string,
    template: string,
    context: object,
  ) {
    try {
      await this.mailer.sendMail({
        to,
        subject,
        template,
        context: { ...context, year: this.year },
      });
      this.logger.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    } catch (err) {
      this.logger.error(`[EMAIL FAILED] To: ${to} | Subject: ${subject} | ${err?.message}`);
    }
  }

  async sendWelcomeMentee(to: string, name: string) {
    const loginUrl = `${this.frontendUrl}/auth/login`;
    await this.send(to, 'Welcome to TektonX!', 'welcome-mentee', { name, loginUrl });
  }

  async sendMentorApplicationReceived(to: string, name: string) {
    await this.send(to, 'TektonX — Application Received', 'welcome-mentor-pending', { name });
  }

  async sendMentorApproved(to: string, name: string) {
    const loginUrl = `${this.frontendUrl}/auth/login`;
    await this.send(to, "You've Been Approved as a TektonX Mentor!", 'mentor-approved', { name, loginUrl });
  }

  async sendMentorRejected(to: string, name: string, reason?: string) {
    await this.send(to, 'TektonX — Mentor Application Update', 'mentor-rejected', {
      name,
      reason: reason || null,
      contactEmail: 'tektonxlabs@gmail.com',
    });
  }

  async sendMenteeAssigned(
    to: string,
    menteeName: string,
    mentorName: string,
    mentorTrack: string,
  ) {
    const dashboardUrl = `${this.frontendUrl}/dashboard/mentee`;
    await this.send(to, "You've Been Assigned a Mentor!", 'mentee-assigned', {
      menteeName,
      mentorName,
      mentorTrack,
      dashboardUrl,
    });
  }

  async sendMentorNewMentees(
    to: string,
    mentorName: string,
    mentees: { name: string; track: string }[],
  ) {
    const dashboardUrl = `${this.frontendUrl}/dashboard/mentor`;
    await this.send(to, 'New Mentee Assignment — TektonX', 'mentor-new-mentees', {
      mentorName,
      mentees,
      dashboardUrl,
    });
  }

  async sendPasswordReset(to: string, name: string, resetUrl: string) {
    await this.send(to, 'Reset Your Password — TektonX', 'password-reset', { name, resetUrl });
  }

  async sendMilestoneCompleted(to: string, name: string, track: string) {
    const dashboardUrl = `${this.frontendUrl}/dashboard/mentee`;
    await this.send(to, "Congratulations! You've Completed TektonX!", 'milestone-completed', {
      name,
      track,
      dashboardUrl,
    });
  }
}
