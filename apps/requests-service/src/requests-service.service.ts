import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ContactService } from './contact/contact.service';
import { PartnershipService } from './partnership/partnership.service';
import { VolunteerService } from './volunteer/volunteer.service';
import { FundraiseService } from './fundraise/fundraise.service';
import { MembershipRequestService } from './membership-request/membership-request.service';
import { CreateContactDto } from './contact/dto/create-contact.dto';
import { CreatePartnershipDto } from './partnership/dto/create-partnership.dto';
import { CreateVolunteerDto } from './volunteer/dto/create-volunteer.dto';
import { CreateFundraiseDto } from './fundraise/dto/create-fundraise.dto';
import { CreateMembershipRequestDto } from './membership-request/dto/create-membership-request.dto';
import { UpdateRequestStatusDto } from './common/dto/update-request-status.dto';
import {
  NOTIFICATION_SERVICE,
  NOTIFICATION_EVENTS,
  RequestStatus,
} from '@app/common';

@Injectable()
export class RequestsService {
  constructor(
    private readonly contactService: ContactService,
    private readonly partnershipService: PartnershipService,
    private readonly volunteerService: VolunteerService,
    private readonly fundraiseService: FundraiseService,
    private readonly membershipRequestService: MembershipRequestService,

    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
  ) {}

  // ─────────────────────────────────────────────────────────
  // SUBMIT HANDLERS
  // ─────────────────────────────────────────────────────────

  async submitContact(dto: CreateContactDto) {
    const request = await this.contactService.create(dto);

    // 🔔 Notify submitter
    this.notificationClient.emit(NOTIFICATION_EVENTS.REQUEST_RECEIVED, {
      email: dto.email,
      fullName: dto.fullName,
      requestType: 'contact',
      referenceId: request.id,
    });

    return request;
  }

  async submitPartnership(dto: CreatePartnershipDto) {
    const request = await this.partnershipService.create(dto);

    this.notificationClient.emit(NOTIFICATION_EVENTS.REQUEST_RECEIVED, {
      email: dto.contactEmail,
      fullName: dto.contactPersonName,
      requestType: 'partnership',
      referenceId: request.id,
    });

    return request;
  }

  async submitVolunteer(dto: CreateVolunteerDto) {
    const request = await this.volunteerService.create(dto);

    this.notificationClient.emit(NOTIFICATION_EVENTS.REQUEST_RECEIVED, {
      email: dto.email,
      fullName: dto.fullName,
      requestType: 'volunteer',
      referenceId: request.id,
    });

    return request;
  }

  async submitFundraise(dto: CreateFundraiseDto) {
    const request = await this.fundraiseService.create(dto);

    this.notificationClient.emit(NOTIFICATION_EVENTS.REQUEST_RECEIVED, {
      email: dto.email,
      fullName: dto.fullName,
      requestType: 'fundraise',
      referenceId: request.id,
    });

    return request;
  }

  async submitMembershipRequest(dto: CreateMembershipRequestDto) {
    const request = await this.membershipRequestService.create(dto);

    this.notificationClient.emit(NOTIFICATION_EVENTS.REQUEST_RECEIVED, {
      email: dto.email,
      fullName: dto.fullName,
      requestType: 'membership',
      referenceId: request.id,
    });

    return request;
  }

  // ─────────────────────────────────────────────────────────
  // GET ALL (with type routing)
  // ─────────────────────────────────────────────────────────

  async getAll(
    type: string,
    page: number = 1,
    limit: number = 10,
    status?: RequestStatus,
  ) {
    switch (type) {
      case 'contact':
        return this.contactService.findAll(page, limit, status);
      case 'partnership':
        return this.partnershipService.findAll(page, limit, status);
      case 'volunteer':
        return this.volunteerService.findAll(page, limit, status);
      case 'fundraise':
        return this.fundraiseService.findAll(page, limit, status);
      case 'membership':
        return this.membershipRequestService.findAll(page, limit, status);
      default:
        throw new Error(`Unknown request type: ${type}`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // GET BY ID (with type routing)
  // ─────────────────────────────────────────────────────────

  async getById(type: string, id: string) {
    switch (type) {
      case 'contact':
        return this.contactService.findById(id);
      case 'partnership':
        return this.partnershipService.findById(id);
      case 'volunteer':
        return this.volunteerService.findById(id);
      case 'fundraise':
        return this.fundraiseService.findById(id);
      case 'membership':
        return this.membershipRequestService.findById(id);
      default:
        throw new Error(`Unknown request type: ${type}`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // UPDATE STATUS (with type routing)
  // ─────────────────────────────────────────────────────────

  async updateStatus(type: string, id: string, dto: UpdateRequestStatusDto) {
    let updated: any;

    switch (type) {
      case 'contact':
        updated = await this.contactService.updateStatus(id, dto);
        break;
      case 'partnership':
        updated = await this.partnershipService.updateStatus(id, dto);
        break;
      case 'volunteer':
        updated = await this.volunteerService.updateStatus(id, dto);
        break;
      case 'fundraise':
        updated = await this.fundraiseService.updateStatus(id, dto);
        break;
      case 'membership':
        updated = await this.membershipRequestService.updateStatus(id, dto);
        break;
      default:
        throw new Error(`Unknown request type: ${type}`);
    }

    // 🔔 Emit status update notification
    if (
      dto.status === RequestStatus.APPROVED ||
      dto.status === RequestStatus.REJECTED ||
      dto.status === RequestStatus.UNDER_REVIEW
    ) {
      const email = updated.email || updated.contactEmail;
      const fullName = updated.fullName || updated.contactPersonName;

      if (email) {
        this.notificationClient.emit(
          NOTIFICATION_EVENTS.REQUEST_STATUS_UPDATED,
          {
            email,
            fullName,
            requestType: type,
            status: dto.status,
            adminNotes: dto.adminNotes,
            referenceId: updated.id,
          },
        );
      }
    }

    return updated;
  }

  // ─────────────────────────────────────────────────────────
  // AGGREGATED STATS
  // ─────────────────────────────────────────────────────────

  async getStats() {
    const [contact, partnership, volunteer, fundraise, membership] =
      await Promise.all([
        this.contactService.getStats(),
        this.partnershipService.getStats(),
        this.volunteerService.getStats(),
        this.fundraiseService.getStats(),
        this.membershipRequestService.getStats(),
      ]);

    return {
      total:
        contact.total +
        partnership.total +
        volunteer.total +
        fundraise.total +
        membership.total,
      pending:
        contact.pending +
        partnership.pending +
        volunteer.pending +
        fundraise.pending +
        membership.pending,
      breakdown: {
        contact,
        partnership,
        volunteer,
        fundraise,
        membership,
      },
    };
  }
}
