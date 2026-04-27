import { Entity, Column } from 'typeorm';
import { BaseRequest } from './base-request.entity';

@Entity('volunteer_requests')
export class VolunteerRequest extends BaseRequest {
  @Column()
  fullName!: string;

  @Column()
  email!: string;

  @Column()
  phone!: string;

  @Column()
  city!: string;

  @Column()
  occupation!: string;

  @Column('simple-array')
  availableDays!: string[];

  @Column({
    type: 'enum',
    enum: ['children', 'elderly', 'mental_health', 'events', 'admin', 'any'],
  })
  preferredArea!: string;

  @Column({ nullable: true, type: 'text' })
  motivation!: string;

  @Column({ nullable: true })
  cvUrl!: string;
}
