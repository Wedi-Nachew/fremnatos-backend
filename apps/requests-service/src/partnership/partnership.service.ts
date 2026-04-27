import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnershipRequest } from '../entities/partnership-request.entity';
import { CreatePartnershipDto } from './dto/create-partnership.dto';
import { UpdateRequestStatusDto } from '../common/dto/update-request-status.dto';
import { RequestStatus } from '@app/common';

@Injectable()
export class PartnershipService {
  constructor(
    @InjectRepository(PartnershipRequest)
    private readonly partnershipRepo: Repository<PartnershipRequest>,
  ) {}

  async create(dto: CreatePartnershipDto): Promise<PartnershipRequest> {
    const request = this.partnershipRepo.create(dto);
    return this.partnershipRepo.save(request);
  }

  async findAll(page: number = 1, limit: number = 10, status?: RequestStatus) {
    const query = this.partnershipRepo
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

  async findById(id: string): Promise<PartnershipRequest> {
    const request = await this.partnershipRepo.findOne({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Partnership request not found');
    }
    return request;
  }

  async updateStatus(
    id: string,
    dto: UpdateRequestStatusDto,
  ): Promise<PartnershipRequest> {
    const request = await this.findById(id);

    request.status = dto.status;
    request.adminNotes = dto.adminNotes ?? request.adminNotes;
    request.reviewedBy = dto.reviewedBy ?? request.reviewedBy;
    request.reviewedAt = new Date();

    return this.partnershipRepo.save(request);
  }

  async getStats() {
    const total = await this.partnershipRepo.count();
    const pending = await this.partnershipRepo.count({
      where: { status: RequestStatus.PENDING },
    });
    const approved = await this.partnershipRepo.count({
      where: { status: RequestStatus.APPROVED },
    });
    return { total, pending, approved };
  }
}
