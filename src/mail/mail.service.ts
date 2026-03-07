import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  private async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: object,
  ) {
    // Log the email details. MailerModule integration can be added later.
    this.logger.log(
      `[EMAIL] To: ${to} | Subject: ${subject} | Template: ${template} | Context: ${JSON.stringify(context)}`,
    );
  }

  async sendWelcomeMentee(to: string, name: string) {
    const loginUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:5173')}/auth/login`;
    await this.sendEmail(to, 'Welcome to TektonX!', 'welcome-mentee', { name, loginUrl });
  }

  async sendMentorApplicationReceived(to: string, name: string) {
    await this.sendEmail(
      to,
      'TektonX — Application Received',
      'welcome-mentor-pending',
      { name },
    );
  }

  async sendMentorApproved(to: string, name: string) {
    const loginUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:5173')}/auth/login`;
    await this.sendEmail(
      to,
      "You've Been Approved as a TektonX Mentor!",
      'mentor-approved',
      { name, loginUrl },
    );
  }

  async sendMentorRejected(to: string, name: string, reason?: string) {
    await this.sendEmail(to, 'TektonX — Mentor Application Update', 'mentor-rejected', {
      name,
      reason: reason || 'No specific reason provided.',
      contactEmail: 'tektonxlabs@gmail.com',
    });
  }

  async sendMenteeAssigned(
    to: string,
    menteeName: string,
    mentorName: string,
    mentorTrack: string,
  ) {
    const dashboardUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:5173')}/dashboard/mentee`;
    await this.sendEmail(to, "You've Been Assigned a Mentor!", 'mentee-assigned', {
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
    const dashboardUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:5173')}/dashboard/mentor`;
    await this.sendEmail(to, 'New Mentee Assignment', 'mentor-new-mentees', {
      mentorName,
      mentees,
      dashboardUrl,
    });
  }

  async sendPasswordReset(to: string, name: string, resetUrl: string) {
    await this.sendEmail(to, 'Reset Your Password — TektonX', 'password-reset', {
      name,
      resetUrl,
    });
  }

  async sendMilestoneCompleted(to: string, name: string, track: string) {
    const dashboardUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:5173')}/dashboard/mentee`;
    await this.sendEmail(to, "Congratulations! You've Completed TektonX!", 'milestone-completed', {
      name,
      track,
      dashboardUrl,
    });
  }
}
