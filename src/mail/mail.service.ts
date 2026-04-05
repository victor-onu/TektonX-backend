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
        context: { ...context, year: this.year, frontendUrl: this.frontendUrl },
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

  async sendMenteeApplicationReceived(to: string, name: string) {
    await this.send(to, 'TektonX — Application Received', 'mentee-application-received', { name });
  }

  async sendMentorApplicationReceived(to: string, name: string) {
    const dashboardUrl = `${this.frontendUrl}/dashboard/mentor`;
    await this.send(to, 'TektonX — Application Received', 'welcome-mentor-pending', { name, dashboardUrl });
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

  async sendMenteeApproved(to: string, name: string) {
    const loginUrl = `${this.frontendUrl}/auth/login`;
    await this.send(to, 'Your TektonX Application Has Been Approved!', 'mentee-approved', { name, loginUrl });
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

  async sendInvite(to: string, name: string, activateUrl: string) {
    await this.send(to, "You've Been Invited to TektonX", 'invite', { name, activateUrl });
  }

  async sendPartnershipConfirmation(to: string, contactName: string, companyName: string) {
    await this.send(
      to,
      'Partnership Inquiry Received — TektonX',
      'partnership-confirmation',
      { contactName, companyName },
    );
  }

  async sendPartnershipAdminNotification(
    companyName: string,
    contactName: string,
    email: string,
    partnershipType: string,
    message?: string,
  ) {
    const adminEmail = this.config.get<string>('MAIL_USER', 'tektonxlabs@gmail.com');
    await this.send(
      adminEmail,
      `New Partnership Inquiry — ${companyName}`,
      'partnership-admin-notify',
      { companyName, contactName, email, partnershipType, message: message ?? null },
    );
  }
}
