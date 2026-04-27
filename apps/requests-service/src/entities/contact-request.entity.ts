import { Entity, Column } from 'typeorm';
import { BaseRequest } from './base-request.entity';

@Entity('contact_requests')
export class ContactRequest extends BaseRequest {
  @Column()
  fullName!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column()
  subject!: string;

  @Column({ type: 'text' })
  message!: string;
}
