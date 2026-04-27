import { Entity, Column } from 'typeorm';
import { BaseRequest } from './base-request.entity';

@Entity('fundraise_requests')
export class FundraiseRequest extends BaseRequest {
  @Column()
  fullName!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column()
  campaignTitle!: string;

  @Column({ type: 'text' })
  campaignDescription!: string;

  @Column({
    nullable: true,
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  targetAmount!: number;

  @Column({ nullable: true, type: 'date' })
  targetDate!: Date;

  @Column({ nullable: true })
  campaignLink!: string;
}
