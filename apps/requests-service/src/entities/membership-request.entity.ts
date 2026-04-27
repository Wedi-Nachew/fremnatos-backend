import { Entity, Column } from 'typeorm';
import { BaseRequest } from './base-request.entity';

// This is different from the skill-based membership in User Service
// This is a public inquiry from someone who wants to become
// a community member / supporter — handled by admin
@Entity('membership_requests')
export class MembershipRequest extends BaseRequest {
  @Column()
  fullName!: string;

  @Column()
  email!: string;

  @Column()
  phone!: string;

  @Column()
  city!: string;

  @Column({
    type: 'enum',
    enum: ['individual', 'family', 'corporate'],
    default: 'individual',
  })
  membershipCategory!: string;

  @Column({ nullable: true, type: 'text' })
  reasonForJoining!: string;

  @Column({ nullable: true })
  occupation!: string;
}
