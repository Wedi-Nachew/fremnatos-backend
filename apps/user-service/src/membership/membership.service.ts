import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from '../entities/membership.entity';
import { User } from '../entities/user.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATION_EVENTS } from '@app/common';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepo: Repository<Membership>,

    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,

    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  // ── Apply for Expert Membership ──────────────────────────
  async applyForMembership(
    createMembershipDto: CreateMembershipDto,
  ): Promise<Membership> {
    const { email, userId } = createMembershipDto;

    let existingApplication: Membership | null = null;

    if (userId) {
      existingApplication = await this.membershipRepo.findOne({
        where: { userId },
      });
    }

    if (!existingApplication) {
      existingApplication = await this.membershipRepo.findOne({
        where: { email },
      });
    }

    if (existingApplication) {
      // Allow re-application only if previously rejected
      if (existingApplication.status !== 'rejected') {
        throw new ConflictException(
          'An application with this email already exists. ' +
            'Please wait for your current application to be reviewed.',
        );
      }

      // Allow rejected applicants to re-apply by removing old record
      await this.membershipRepo.remove(existingApplication);
    }

    // If userId provided, check user exists
    if (userId) {
      const user = await this.usersRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(
          'User account not found. Please register first.',
        );
      }
    }

    // Create the membership application
    const membership = this.membershipRepo.create({
      fullName: createMembershipDto.fullName,
      email: createMembershipDto.email,
      primaryExpertise: createMembershipDto.primaryExpertise,
      yearsOfExperience: createMembershipDto.yearsOfExperience,
      currentRole: createMembershipDto.currentRole,
      availabilityHoursPerWeek: createMembershipDto.availabilityHoursPerWeek,
      contributionNote: createMembershipDto.contributionNote,
      userId: createMembershipDto.userId ?? null,
      status: 'pending',
    });

    const saved = await this.membershipRepo.save(membership);

    // 🔔 Emit membership received event
    this.notificationClient.emit(NOTIFICATION_EVENTS.MEMBERSHIP_RECEIVED, {
      email: saved.email,
      fullName: saved.fullName,
      primaryExpertise: saved.primaryExpertise,
      yearsOfExperience: saved.yearsOfExperience,
      currentRole: saved.currentRole,
      availabilityHoursPerWeek: saved.availabilityHoursPerWeek,
    });

    return saved;
  }

  // ── Get Membership by User ID ─────────────────────────────
  async getMembershipByUserId(userId: string): Promise<Membership> {
    const membership = await this.membershipRepo.findOne({
      where: { userId },
    });

    if (!membership) {
      throw new NotFoundException(
        'No membership application found for this user',
      );
    }

    return membership;
  }

  // ── Get Membership by ID ──────────────────────────────────
  async getMembershipById(id: string): Promise<Membership> {
    const membership = await this.membershipRepo.findOne({
      where: { id },
    });

    if (!membership) {
      throw new NotFoundException('Membership application not found');
    }

    return membership;
  }

  // ── Get All Applications (Admin) ──────────────────────────
  async getAllApplications(
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<{
    applications: Membership[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = this.membershipRepo.createQueryBuilder('membership');

    if (status) {
      query.where('membership.status = :status', { status });
    }

    const [applications, total] = await query
      .orderBy('membership.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Review Application (Admin) ────────────────────────────
  async reviewApplication(
    id: string,
    updateMembershipDto: UpdateMembershipDto,
  ): Promise<Membership> {
    const membership = await this.getMembershipById(id);

    const status: string | undefined = updateMembershipDto.status;
    const adminNotes: string | undefined = updateMembershipDto.adminNotes;
    const reviewedBy: string | undefined = updateMembershipDto.reviewedBy;

    // If approving — generate membership number and
    // mark user as member if they have an account
    if (status === 'approved' && membership.status !== 'approved') {
      membership.membershipNumber = await this.generateMembershipNumber();

      // If linked to a registered user, mark them as a member
      if (membership.userId) {
        await this.usersRepo.update(
          { id: membership.userId },
          { isMember: true },
        );
      }
    }

    // If rejecting an approved member — remove member status
    if (status === 'rejected' && membership.status === 'approved') {
      if (membership.userId) {
        await this.usersRepo.update(
          { id: membership.userId },
          { isMember: false },
        );
      }
      membership.membershipNumber = null;
    }

    membership.status = status ?? membership.status;

    if (typeof adminNotes === 'string') {
      membership.adminNotes = adminNotes;
    }

    if (typeof reviewedBy === 'string') {
      membership.reviewedBy = reviewedBy;
    }

    membership.reviewedAt = new Date();

    const updated = await this.membershipRepo.save(membership);

    // 🔔 Emit status update event (only for meaningful status changes)
    if (
      status === 'approved' ||
      status === 'rejected' ||
      status === 'under_review'
    ) {
      this.notificationClient.emit(
        NOTIFICATION_EVENTS.MEMBERSHIP_STATUS_UPDATED,
        {
          email: updated.email,
          fullName: updated.fullName,
          primaryExpertise: updated.primaryExpertise,
          status: updated.status,
          membershipNumber: updated.membershipNumber,
          adminNotes: updated.adminNotes,
        },
      );
    }

    return updated;
  }

  // ── Get Membership Stats (Dashboard) ─────────────────────
  async getMembershipStats(): Promise<{
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
  }> {
    const total = await this.membershipRepo.count();

    const pending = await this.membershipRepo.count({
      where: { status: 'pending' },
    });

    const underReview = await this.membershipRepo.count({
      where: { status: 'under_review' },
    });

    const approved = await this.membershipRepo.count({
      where: { status: 'approved' },
    });

    const rejected = await this.membershipRepo.count({
      where: { status: 'rejected' },
    });

    return { total, pending, underReview, approved, rejected };
  }

  // ── Private: Generate Membership Number ──────────────────
  private async generateMembershipNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const approvedCount = await this.membershipRepo.count({
      where: { status: 'approved' },
    });
    const paddedCount = String(approvedCount + 1).padStart(4, '0');
    return `FRM-EXP-${year}-${paddedCount}`;
  }
}
