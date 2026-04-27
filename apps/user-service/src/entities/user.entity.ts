import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Role } from '@app/common';
import { Membership } from './membership.entity';

@Entity('users')
export class User {
  // Same UUID as AuthCredential in auth_db
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  profilePhoto!: string;

  @Column({ nullable: true, type: 'text' })
  bio!: string;

  @Column({ nullable: true })
  city!: string;

  // True once their expert membership application is approved
  @Column({ default: false })
  isMember!: boolean;

  @Column({
    type: 'enum',
    enum: [
      Role.MEMBER,
      Role.ADMIN,
      Role.SUPER_ADMIN,
      'active',
      'suspended',
      'deactivated',
    ],
    default: Role.MEMBER,
  })
  status!: string;

  @CreateDateColumn()
  joinedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Membership, (membership) => membership.user)
  membership!: Membership;
}
