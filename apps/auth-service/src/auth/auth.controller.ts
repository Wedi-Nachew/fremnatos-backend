import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AUTH_PATTERNS } from '@app/common';
import { Role } from '@app/common';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  async register(@Payload() registerDto: RegisterDto) {
    this.logger.log(`[REGISTER] Received payload: ${JSON.stringify(registerDto)}`);
    try {
      const result = await this.authService.register(registerDto);
      this.logger.log(`[REGISTER] Success: user ${result.user?.id || 'unknown'} created`);
      return result;
    } catch (error) {
      this.logger.error(`[REGISTER] Failed: ${error?.message || JSON.stringify(error)}`);
      throw error;
    }
  }

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  async login(@Payload() loginDto: LoginDto) {
    this.logger.log(`[LOGIN] Received payload for email: ${loginDto.email}`);
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`[LOGIN] Success: user ${result.user?.id || 'unknown'} logged in`);
      return result;
    } catch (error) {
      this.logger.error(`[LOGIN] Failed: ${error?.message || JSON.stringify(error)}`);
      throw error;
    }
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT)
  async logout(@Payload() data: { userId: string }) {
    this.logger.log(`[LOGOUT] Received payload for userId: ${data.userId}`);
    try {
      const result = await this.authService.logout(data.userId);
      this.logger.log(`[LOGOUT] Success: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`[LOGOUT] Failed: ${error?.message || JSON.stringify(error)}`);
      throw error;
    }
  }

  @MessagePattern(AUTH_PATTERNS.VERIFY_TOKEN)
  async verifyToken(@Payload() data: { token: string }) {
    this.logger.log(`[VERIFY_TOKEN] Received token (first 20 chars): ${data.token?.substring(0, 20)}...`);
    try {
      const result = await this.authService.verifyToken(data.token);
      this.logger.log(`[VERIFY_TOKEN] Success: user ${result.sub}`);
      return result;
    } catch (error) {
      this.logger.error(`[VERIFY_TOKEN] Failed: ${error?.message || JSON.stringify(error)}`);
      throw error;
    }
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH_TOKEN)
  async refreshToken(@Payload() data: { refreshToken: string }) {
    this.logger.log(`[REFRESH_TOKEN] Received token (first 20 chars): ${data.refreshToken?.substring(0, 20)}...`);
    try {
      const result = await this.authService.refreshToken(data.refreshToken);
      this.logger.log(`[REFRESH_TOKEN] Success: user ${result.user?.id || 'unknown'}`);
      return result;
    } catch (error) {
      this.logger.error(`[REFRESH_TOKEN] Failed: ${error?.message || JSON.stringify(error)}`);
      throw error;
    }
  }

  @MessagePattern(AUTH_PATTERNS.VERIFY_EMAIL)
  async verifyEmail(@Payload() data: { token: string }) {
    this.logger.log(`[VERIFY_EMAIL] Received token: ${data.token?.substring(0, 8)}...`);
    try {
      const result = await this.authService.verifyEmail(data.token);
      this.logger.log(`[VERIFY_EMAIL] Success: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`[VERIFY_EMAIL] Failed: ${error?.message || JSON.stringify(error)}`);
      throw error;
    }
  }

  @MessagePattern(AUTH_PATTERNS.GET_USER_BY_ID)
  async getUserById(@Payload() data: { userId: string }) {
    this.logger.log(`[GET_USER_BY_ID] Received userId: ${data.userId}`);
    try {
      const result = await this.authService.getUserById(data.userId);
      this.logger.log(`[GET_USER_BY_ID] Success: found user ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`[GET_USER_BY_ID] Failed: ${error?.message || JSON.stringify(error)}`);
      throw error;
    }
  }

  @MessagePattern(AUTH_PATTERNS.UPDATE_ROLE)
  async updateRole(@Payload() data: { userId: string; role: Role }) {
    this.logger.log(`[UPDATE_ROLE] Received userId: ${data.userId}, role: ${data.role}`);
    try {
      const result = await this.authService.updateRole(data.userId, data.role);
      this.logger.log(`[UPDATE_ROLE] Success: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`[UPDATE_ROLE] Failed: ${error?.message || JSON.stringify(error)}`);
      throw error;
    }
  }
}
