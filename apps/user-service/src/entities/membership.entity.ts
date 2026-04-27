import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('memberships')
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.membership, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fullName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  primaryExpertise!: string;

  @Column({ type: 'int', nullable: true })
  yearsOfExperience!: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  currentRole!: string;

  @Column({ type: 'int', nullable: true })
  availabilityHoursPerWeek!: number;

  @Column({ type: 'text', nullable: true })
  contributionNote!: string;

  // Auto-generated e.g. FRM-2025-0001
  @Column({ type: 'varchar', unique: true, nullable: true })
  membershipNumber!: string | null;

  @Column({
    type: 'enum',
    enum: ['monthly', 'annually'],
    nullable: true,
  })
  membershipType!: string;

  @Column({
    type: 'enum',
    enum: [
      'active',
      'suspended',
      'expired',
      'pending',
      'under_review',
      'approved',
      'rejected',
    ],
    default: 'pending',
  })
  status!: string;

  @Column({ type: 'text', nullable: true })
  adminNotes!: string;

  @Column({ type: 'varchar', nullable: true })
  reviewedBy!: string;

  @Column({ nullable: true, type: 'timestamp' })
  reviewedAt!: Date;

  @Column({ type: 'date', nullable: true })
  startDate!: Date;

  @Column({ nullable: true, type: 'date' })
  endDate!: Date;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  contributionAmount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
