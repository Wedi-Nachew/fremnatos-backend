import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_PATTERNS } from '@app/common';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USER_PATTERNS.CREATE_PROFILE)
  async createProfile(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.createProfile(createUserDto);
  }

  @MessagePattern(USER_PATTERNS.GET_PROFILE)
  async getProfile(@Payload() data: { userId: string }) {
    return this.usersService.getProfile(data.userId);
  }

  @MessagePattern(USER_PATTERNS.UPDATE_PROFILE)
  async updateProfile(
    @Payload() data: { userId: string; updateDto: UpdateUserDto },
  ) {
    return this.usersService.updateProfile(data.userId, data.updateDto);
  }

  @MessagePattern(USER_PATTERNS.UPLOAD_PHOTO)
  async uploadPhoto(
    @Payload() data: { userId: string; photoUrl: string },
  ) {
    return this.usersService.updateProfilePhoto(
      data.userId,
      data.photoUrl,
    );
  }

  @MessagePattern(USER_PATTERNS.UPDATE_STATUS)
  async updateStatus(
    @Payload() data: { userId: string; status: string },
  ) {
    return this.usersService.updateStatus(data.userId, data.status);
  }

  @MessagePattern(USER_PATTERNS.GET_ALL_MEMBERS)
  async getAllMembers(
    @Payload() data: { page: number; limit: number },
  ) {
    return this.usersService.getAllMembers(data.page, data.limit);
  }

  @MessagePattern(USER_PATTERNS.GET_STATS)
  async getStats() {
    return this.usersService.getStats();
  }
}