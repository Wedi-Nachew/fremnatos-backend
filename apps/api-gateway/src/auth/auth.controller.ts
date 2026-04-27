import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  AUTH_SERVICE,
  USER_SERVICE,
  AUTH_PATTERNS,
  USER_PATTERNS,
  CurrentUser,
} from '@app/common';
import type { JwtPayload } from '@app/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RegisterGatewayDto } from './dto/register-gateway.dto';
import { LoginGatewayDto } from './dto/login-gateway.dto';
import { RefreshTokenGatewayDto } from './dto/refresh-token-gateway.dto';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientProxy,

    @Inject(USER_SERVICE)
    private readonly userClient: ClientProxy,
  ) {}

  // ── Register ───────────────────────────────────────────────
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new member account' })
  @ApiResponse({ status: 201, description: 'Account created' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterGatewayDto) {
    // Step 1: Create auth credential in Auth Service
    const authResult = await firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.REGISTER, registerDto),
    );

    // Step 2: Create user profile in User Service
    // This runs after auth credential is created
    try {
      await firstValueFrom(
        this.userClient.send(USER_PATTERNS.CREATE_PROFILE, {
          id: authResult.user.id,
          email: authResult.user.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        }),
      );
    } catch (profileError) {
      // Log but don't fail — profile creation is non-critical
      // in Phase 4 (user can update profile later)
      console.error('Profile creation failed:', profileError.message);
    }

    return authResult;
  }

  // ── Login ──────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive JWT tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginGatewayDto) {
    return firstValueFrom(this.authClient.send(AUTH_PATTERNS.LOGIN, loginDto));
  }

  // ── Logout ─────────────────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.LOGOUT, { userId: user.sub }),
    );
  }

  // ── Refresh Token ──────────────────────────────────────────
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: RefreshTokenGatewayDto) {
    return firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.REFRESH_TOKEN, {
        refreshToken: body.refreshToken,
      }),
    );
  }

  // ── Verify Email ───────────────────────────────────────────
  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(@Param('token') token: string) {
    return firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.VERIFY_EMAIL, { token }),
    );
  }

  // ── Get Me ─────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user auth info' })
  async getMe(@CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.GET_USER_BY_ID, {
        userId: user.sub,
      }),
    );
  }
}
