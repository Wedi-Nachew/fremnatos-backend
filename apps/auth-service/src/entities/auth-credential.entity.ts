import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '@app/common';

@Entity('auth_credentials')
export class AuthCredential {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.MEMBER,
  })
  role!: Role;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ nullable: true, type: 'text' })
  refreshToken!: string;

  @Column({ nullable: true, type: 'text' })
  verificationToken!: string;

  @Column({ nullable: true, type: 'text' })
  passwordResetToken!: string;

  @Column({ nullable: true, type: 'timestamp' })
  passwordResetExpiry!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
