import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RequestStatus } from '@app/common';

export abstract class BaseRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  @Column({ nullable: true, type: 'text' })
  adminNotes!: string;

  @Column({ nullable: true })
  reviewedBy!: string; // Admin user ID

  @Column({ nullable: true, type: 'timestamp' })
  reviewedAt!: Date;

  @CreateDateColumn()
  submittedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
