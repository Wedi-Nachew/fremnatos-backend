import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipRequest } from '../entities/membership-request.entity';
import { CreateMembershipRequestDto } from './dto/create-membership-request.dto';
import { UpdateRequestStatusDto } from '../common/dto/update-request-status.dto';
import { RequestStatus } from '@app/common';

@Injectable()
export class MembershipRequestService {
  constructor(
    @InjectRepository(MembershipRequest)
    private readonly membershipRequestRepo: Repository<MembershipRequest>,
  ) {}

  async create(dto: CreateMembershipRequestDto): Promise<MembershipRequest> {
    const request = this.membershipRequestRepo.create(dto);
    return this.membershipRequestRepo.save(request);
  }

  async findAll(page: number = 1, limit: number = 10, status?: RequestStatus) {
    const query = this.membershipRequestRepo
      .createQueryBuilder('r')
      .orderBy('r.submittedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      query.where('r.status = :status', { status });
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<MembershipRequest> {
    const request = await this.membershipRequestRepo.findOne({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Membership request not found');
    }
    return request;
  }

  async updateStatus(
    id: string,
    dto: UpdateRequestStatusDto,
  ): Promise<MembershipRequest> {
    const request = await this.findById(id);

    request.status = dto.status;
    request.adminNotes = dto.adminNotes ?? request.adminNotes;
    request.reviewedBy = dto.reviewedBy ?? request.reviewedBy;
    request.reviewedAt = new Date();

    return this.membershipRequestRepo.save(request);
  }

  async getStats() {
    const total = await this.membershipRequestRepo.count();
    const pending = await this.membershipRequestRepo.count({
      where: { status: RequestStatus.PENDING },
    });
    const approved = await this.membershipRequestRepo.count({
      where: { status: RequestStatus.APPROVED },
    });
    return { total, pending, approved };
  }
}
