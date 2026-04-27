import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FundraiseRequest } from '../entities/fundraise-request.entity';
import { CreateFundraiseDto } from './dto/create-fundraise.dto';
import { UpdateRequestStatusDto } from '../common/dto/update-request-status.dto';
import { RequestStatus } from '@app/common';

@Injectable()
export class FundraiseService {
  constructor(
    @InjectRepository(FundraiseRequest)
    private readonly fundraiseRepo: Repository<FundraiseRequest>,
  ) {}

  async create(dto: CreateFundraiseDto): Promise<FundraiseRequest> {
    const request = this.fundraiseRepo.create(dto);
    return this.fundraiseRepo.save(request);
  }

  async findAll(page: number = 1, limit: number = 10, status?: RequestStatus) {
    const query = this.fundraiseRepo
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

  async findById(id: string): Promise<FundraiseRequest> {
    const request = await this.fundraiseRepo.findOne({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Fundraise request not found');
    }
    return request;
  }

  async updateStatus(
    id: string,
    dto: UpdateRequestStatusDto,
  ): Promise<FundraiseRequest> {
    const request = await this.findById(id);

    request.status = dto.status;
    request.adminNotes = dto.adminNotes ?? request.adminNotes;
    request.reviewedBy = dto.reviewedBy ?? request.reviewedBy;
    request.reviewedAt = new Date();

    return this.fundraiseRepo.save(request);
  }

  async getStats() {
    const total = await this.fundraiseRepo.count();
    const pending = await this.fundraiseRepo.count({
      where: { status: RequestStatus.PENDING },
    });
    const approved = await this.fundraiseRepo.count({
      where: { status: RequestStatus.APPROVED },
    });
    return { total, pending, approved };
  }
}
