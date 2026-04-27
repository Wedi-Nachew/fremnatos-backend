import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestsService } from './requests.service';
import { CreateContactDto } from './contact/dto/create-contact.dto';
import { CreatePartnershipDto } from './partnership/dto/create-partnership.dto';
import { CreateVolunteerDto } from './volunteer/dto/create-volunteer.dto';
import { CreateFundraiseDto } from './fundraise/dto/create-fundraise.dto';
import { CreateMembershipRequestDto } from './membership-request/dto/create-membership-request.dto';
import { UpdateRequestStatusDto } from './common/dto/update-request-status.dto';
import { REQUESTS_PATTERNS, RequestStatus } from '@app/common';

@Controller()
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // ── Submit Handlers ──────────────────────────────────────
  @MessagePattern(REQUESTS_PATTERNS.SUBMIT_CONTACT)
  async submitContact(@Payload() dto: CreateContactDto) {
    return this.requestsService.submitContact(dto);
  }

  @MessagePattern(REQUESTS_PATTERNS.SUBMIT_PARTNERSHIP)
  async submitPartnership(@Payload() dto: CreatePartnershipDto) {
    return this.requestsService.submitPartnership(dto);
  }

  @MessagePattern(REQUESTS_PATTERNS.SUBMIT_VOLUNTEER)
  async submitVolunteer(@Payload() dto: CreateVolunteerDto) {
    return this.requestsService.submitVolunteer(dto);
  }

  @MessagePattern(REQUESTS_PATTERNS.SUBMIT_FUNDRAISE)
  async submitFundraise(@Payload() dto: CreateFundraiseDto) {
    return this.requestsService.submitFundraise(dto);
  }

  @MessagePattern(REQUESTS_PATTERNS.SUBMIT_MEMBERSHIP)
  async submitMembershipRequest(@Payload() dto: CreateMembershipRequestDto) {
    return this.requestsService.submitMembershipRequest(dto);
  }

  // ── Get All ──────────────────────────────────────────────
  @MessagePattern(REQUESTS_PATTERNS.GET_ALL)
  async getAll(
    @Payload()
    data: {
      type: string;
      page: number;
      limit: number;
      status?: RequestStatus;
    },
  ) {
    return this.requestsService.getAll(
      data.type,
      data.page,
      data.limit,
      data.status,
    );
  }

  // ── Get By ID ────────────────────────────────────────────
  @MessagePattern(REQUESTS_PATTERNS.GET_BY_ID)
  async getById(@Payload() data: { type: string; id: string }) {
    return this.requestsService.getById(data.type, data.id);
  }

  // ── Update Status ────────────────────────────────────────
  @MessagePattern(REQUESTS_PATTERNS.UPDATE_STATUS)
  async updateStatus(
    @Payload()
    data: {
      type: string;
      id: string;
      updateDto: UpdateRequestStatusDto;
    },
  ) {
    return this.requestsService.updateStatus(
      data.type,
      data.id,
      data.updateDto,
    );
  }

  // ── Get Stats ────────────────────────────────────────────
  @MessagePattern(REQUESTS_PATTERNS.GET_STATS)
  async getStats() {
    return this.requestsService.getStats();
  }
}
