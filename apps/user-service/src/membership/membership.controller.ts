import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { USER_PATTERNS } from '@app/common';

@Controller()
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  // Public: Anyone can apply
  @MessagePattern(USER_PATTERNS.APPLY_MEMBERSHIP)
  async applyForMembership(
    @Payload() createMembershipDto: CreateMembershipDto,
  ) {
    return this.membershipService.applyForMembership(createMembershipDto);
  }

  // Member: Get their own application status
  @MessagePattern(USER_PATTERNS.GET_MEMBERSHIP)
  async getMembershipByUserId(@Payload() data: { userId: string }) {
    return this.membershipService.getMembershipByUserId(data.userId);
  }

  // Admin: Get all applications
  @MessagePattern(USER_PATTERNS.GET_ALL_APPLICATIONS)
  async getAllApplications(
    @Payload() data: { page: number; limit: number; status?: string },
  ) {
    return this.membershipService.getAllApplications(
      data.page,
      data.limit,
      data.status,
    );
  }

  // Admin: Review/update an application
  @MessagePattern(USER_PATTERNS.REVIEW_MEMBERSHIP)
  async reviewApplication(
    @Payload() data: { id: string; updateDto: UpdateMembershipDto },
  ) {
    return this.membershipService.reviewApplication(data.id, data.updateDto);
  }

  // Admin Dashboard stats
  @MessagePattern(USER_PATTERNS.GET_MEMBERSHIP_STATS)
  async getMembershipStats() {
    return this.membershipService.getMembershipStats();
  }
}
