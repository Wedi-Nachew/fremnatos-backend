import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VolunteerRequest } from '../entities/volunteer-request.entity';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateRequestStatusDto } from '../common/dto/update-request-status.dto';
import { RequestStatus } from '@app/common';

@Injectable()
export class VolunteerService {
  constructor(
    @InjectRepository(VolunteerRequest)
    private readonly volunteerRepo: Repository<VolunteerRequest>,
  ) {}

  async create(dto: CreateVolunteerDto): Promise<VolunteerRequest> {
    const request = this.volunteerRepo.create(dto);
    return this.volunteerRepo.save(request);
  }

  async findAll(page: number = 1, limit: number = 10, status?: RequestStatus) {
    const query = this.volunteerRepo
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

  async findById(id: string): Promise<VolunteerRequest> {
    const request = await this.volunteerRepo.findOne({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException('Volunteer request not found');
    }
    return request;
  }

  async updateStatus(
    id: string,
    dto: UpdateRequestStatusDto,
  ): Promise<VolunteerRequest> {
    const request = await this.findById(id);

    request.status = dto.status;
    request.adminNotes = dto.adminNotes ?? request.adminNotes;
    request.reviewedBy = dto.reviewedBy ?? request.reviewedBy;
    request.reviewedAt = new Date();

    return this.volunteerRepo.save(request);
  }

  async getStats() {
    const total = await this.volunteerRepo.count();
    const pending = await this.volunteerRepo.count({
      where: { status: RequestStatus.PENDING },
    });
    const approved = await this.volunteerRepo.count({
      where: { status: RequestStatus.APPROVED },
    });
    return { total, pending, approved };
  }
}
