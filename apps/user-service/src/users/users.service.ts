import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@app/common';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // ── Create Profile ───────────────────────────────────────
  async createProfile(createUserDto: CreateUserDto): Promise<User> {
    // Check if user profile already exists
    const existing = await this.usersRepo.findOne({
      where: { id: createUserDto.id },
    });

    if (existing) {
      throw new ConflictException('User profile already exists');
    }

    // Check if email is already taken
    const emailTaken = await this.usersRepo.findOne({
      where: { email: createUserDto.email },
    });

    if (emailTaken) {
      throw new ConflictException('Email already in use');
    }

    const user = this.usersRepo.create({
      id: createUserDto.id,
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phone: createUserDto.phone ?? undefined,
      city: createUserDto.city ?? undefined,
    });

    return this.usersRepo.save(user);
  }

  // ── Get Profile ──────────────────────────────────────────
  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['membership'],
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  // ── Update Profile ───────────────────────────────────────
  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.getProfile(userId);

    Object.assign(user, updateUserDto);
    return this.usersRepo.save(user);
  }

  // ── Update Profile Photo ─────────────────────────────────
  async updateProfilePhoto(userId: string, photoUrl: string): Promise<User> {
    const user = await this.getProfile(userId);

    user.profilePhoto = photoUrl;
    return this.usersRepo.save(user);
  }

  // ── Update Member Status (Admin action) ──────────────────
  async updateStatus(userId: string, status: string): Promise<User> {
    const user = await this.getProfile(userId);

    const allowedRoles = new Set<string>([
      Role.MEMBER,
      Role.ADMIN,
      Role.SUPER_ADMIN,
    ]);

    if (!allowedRoles.has(status)) {
      throw new BadRequestException(
        'Status must be one of: member, admin, super_admin',
      );
    }

    user.status = status;
    return this.usersRepo.save(user);
  }

  // ── Get All Members (Admin) ──────────────────────────────
  async getAllMembers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [users, total] = await this.usersRepo.findAndCount({
      relations: ['membership'],
      order: { joinedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Get Stats (For Admin Dashboard) ─────────────────────
  async getStats(): Promise<{
    total: number;
    member: number;
    admin: number;
    superAdmin: number;
    newThisMonth: number;
  }> {
    const total = await this.usersRepo.count();

    const member = await this.usersRepo.count({
      where: { status: Role.MEMBER },
    });

    const admin = await this.usersRepo.count({
      where: { status: Role.ADMIN },
    });

    const superAdmin = await this.usersRepo.count({
      where: { status: Role.SUPER_ADMIN },
    });

    // Count users created this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newThisMonth = await this.usersRepo
      .createQueryBuilder('user')
      .where('user.joinedAt >= :startOfMonth', { startOfMonth })
      .getCount();

    return { total, member, admin, superAdmin, newThisMonth };
  }
}
