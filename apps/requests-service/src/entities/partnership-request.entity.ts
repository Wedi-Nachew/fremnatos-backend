import { Entity, Column } from 'typeorm';
import { BaseRequest } from './base-request.entity';

@Entity('partnership_requests')
export class PartnershipRequest extends BaseRequest {
  @Column()
  organizationName!: string;

  @Column()
  contactPersonName!: string;

  @Column()
  contactEmail!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  website!: string;

  @Column({
    type: 'enum',
    enum: ['financial', 'in_kind', 'technical', 'media', 'other'],
  })
  partnershipType!: string;

  @Column({ type: 'text' })
  proposalDetails!: string;
}
