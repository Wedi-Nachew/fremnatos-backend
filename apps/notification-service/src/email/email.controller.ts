import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { NOTIFICATION_EVENTS } from '@app/common';

@Controller()
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  // ── Welcome Email ──────────────────────────────────────────
  @EventPattern(NOTIFICATION_EVENTS.WELCOME)
  async handleWelcome(
    @Payload()
    data: {
      email: string;
      firstName: string;
      role: string;
      verificationToken: string;
    },
  ) {
    this.logger.log(`📨 Received welcome event for ${data.email}`);
    await this.emailService.sendWelcomeEmail(data);
  }

  // ── Membership Application Received ───────────────────────
  @EventPattern(NOTIFICATION_EVENTS.MEMBERSHIP_RECEIVED)
  async handleMembershipReceived(
    @Payload()
    data: {
      email: string;
      fullName: string;
      primaryExpertise: string;
      yearsOfExperience: number;
      currentRole: string;
      availabilityHoursPerWeek: number;
    },
  ) {
    this.logger.log(
      `📨 Received membership application event for ${data.email}`,
    );
    await this.emailService.sendMembershipReceivedEmail(data);
  }

  // ── Membership Status Updated ─────────────────────────────
  @EventPattern(NOTIFICATION_EVENTS.MEMBERSHIP_STATUS_UPDATED)
  async handleMembershipStatusUpdate(
    @Payload()
    data: {
      email: string;
      fullName: string;
      primaryExpertise: string;
      status: string;
      membershipNumber?: string;
      adminNotes?: string;
    },
  ) {
    this.logger.log(
      `📨 Received membership status update event: ` +
        `${data.status} for ${data.email}`,
    );
    await this.emailService.sendMembershipStatusUpdateEmail(data);
  }

  // ── General Request Received ──────────────────────────────
  @EventPattern(NOTIFICATION_EVENTS.REQUEST_RECEIVED)
  async handleRequestReceived(
    @Payload()
    data: {
      email: string;
      fullName: string;
      requestType: string;
      referenceId: string;
    },
  ) {
    this.logger.log(
      `📨 Received request event for ` +
        `${data.requestType} from ${data.email}`,
    );
    await this.emailService.sendRequestReceivedEmail(data);
  }
}
