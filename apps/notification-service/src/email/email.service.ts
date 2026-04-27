import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly appUrl: string;
  private readonly apiUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.appUrl = this.configService.get<string>('APP_URL');
    this.apiUrl = this.configService.get<string>('API_URL');
  }

  // ── Welcome Email (After Registration) ──────────────────
  async sendWelcomeEmail(data: {
    email: string;
    firstName: string;
    role: string;
    verificationToken: string;
  }): Promise<void> {
    const verificationUrl = `${this.apiUrl}/api/auth/verify-email/${data.verificationToken}`;

    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: `Welcome to Freminatos, ${data.firstName}! 🌿`,
        template: 'welcome',
        context: {
          firstName: data.firstName,
          email: data.email,
          role: this.formatRole(data.role),
          verificationUrl,
          appUrl: this.appUrl,
        },
      });

      this.logger.log(`✅ Welcome email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send welcome email to ${data.email}`,
        error.message,
      );
      // Do NOT throw — email failure should never break the main flow
    }
  }

  // ── Membership Application Received ─────────────────────
  async sendMembershipReceivedEmail(data: {
    email: string;
    fullName: string;
    primaryExpertise: string;
    yearsOfExperience: number;
    currentRole: string;
    availabilityHoursPerWeek: number;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject:
          '✅ Your Expert Membership Application Has Been Received — Freminatos',
        template: 'membership-received',
        context: {
          fullName: data.fullName,
          email: data.email,
          primaryExpertise: data.primaryExpertise,
          yearsOfExperience: data.yearsOfExperience,
          currentRole: data.currentRole,
          availabilityHoursPerWeek: data.availabilityHoursPerWeek,
          appUrl: this.appUrl,
        },
      });

      this.logger.log(`✅ Membership received email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send membership received email to ${data.email}`,
        error.message,
      );
    }
  }

  // ── Membership Status Update ──────────────────────────────
  async sendMembershipStatusUpdateEmail(data: {
    email: string;
    fullName: string;
    primaryExpertise: string;
    status: string;
    membershipNumber?: string;
    adminNotes?: string;
  }): Promise<void> {
    const subjectMap: Record<string, string> = {
      under_review:
        '👀 Your Membership Application is Under Review — Freminatos',
      approved:
        '🎉 Congratulations! Your Expert Membership is Approved — Freminatos',
      rejected: 'Update on Your Membership Application — Freminatos',
    };

    const subject =
      subjectMap[data.status] ||
      'Update on Your Membership Application — Freminatos';

    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject,
        template: 'membership-status-update',
        context: {
          fullName: data.fullName,
          primaryExpertise: data.primaryExpertise,
          status: data.status,
          membershipNumber: data.membershipNumber || null,
          adminNotes: data.adminNotes || null,
          isApproved: data.status === 'approved',
          isRejected: data.status === 'rejected',
          isUnderReview: data.status === 'under_review',
          appUrl: this.appUrl,
        },
      });

      this.logger.log(
        `✅ Status update email (${data.status}) sent to ${data.email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send status update email to ${data.email}`,
        error.message,
      );
    }
  }

  // ── General Request Received (Contact, Partnership, etc.) ─
  async sendRequestReceivedEmail(data: {
    email: string;
    fullName: string;
    requestType: string;
    referenceId: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: `✅ Request Received — Freminatos Charity Organization`,
        template: 'request-received',
        context: {
          fullName: data.fullName,
          email: data.email,
          requestType: this.formatRequestType(data.requestType),
          referenceId: data.referenceId.substring(0, 8).toUpperCase(),
          submittedAt: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          appUrl: this.appUrl,
        },
      });

      this.logger.log(`✅ Request received email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send request received email to ${data.email}`,
        error.message,
      );
    }
  }

  // ── Private Helpers ────────────────────────────────────────
  private formatRole(role: string): string {
    const roleMap: Record<string, string> = {
      member: 'Community Member',
      admin: 'Administrator',
      super_admin: 'Super Administrator',
    };
    return roleMap[role] || role;
  }

  private formatRequestType(type: string): string {
    const typeMap: Record<string, string> = {
      contact: 'General Contact Inquiry',
      partnership: 'Partnership Proposal',
      volunteer: 'Volunteer Application',
      fundraise: 'Fundraising Campaign Request',
      membership: 'Expert Membership Application',
    };
    return typeMap[type] || type;
  }
}
