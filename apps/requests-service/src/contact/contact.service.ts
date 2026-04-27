import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactRequest } from '../entities/contact-request.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateRequestStatusDto } from '../common/dto/update-request-status.dto';
import { RequestStatus } from '@app/common';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactRequest)
    private readonly contactRepo: Repository<ContactRequest>,
  ) {}

  async create(dto: CreateContactDto): Promise<ContactRequest> {
    const request = this.contactRepo.create(dto);
    return this.contactRepo.save(request);
  }

  async findAll(page: number = 1, limit: number = 10, status?: RequestStatus) {
    const query = this.contactRepo
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

  async findById(id: string): Promise<ContactRequest> {
    const request = await this.contactRepo.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Contact request not found');
    }
    return request;
  }

  async updateStatus(
    id: string,
    dto: UpdateRequestStatusDto,
  ): Promise<ContactRequest> {
    const request = await this.findById(id);

    request.status = dto.status;
    request.adminNotes = dto.adminNotes ?? request.adminNotes;
    request.reviewedBy = dto.reviewedBy ?? request.reviewedBy;
    request.reviewedAt = new Date();

    return this.contactRepo.save(request);
  }

  async getStats() {
    const total = await this.contactRepo.count();
    const pending = await this.contactRepo.count({
      where: { status: RequestStatus.PENDING },
    });
    const approved = await this.contactRepo.count({
      where: { status: RequestStatus.APPROVED },
    });
    return { total, pending, approved };
  }
}
