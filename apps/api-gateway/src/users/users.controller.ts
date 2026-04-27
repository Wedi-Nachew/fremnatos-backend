import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  USER_SERVICE,
  USER_PATTERNS,
  Roles,
  CurrentUser,
  Role,
} from '@app/common';
import type { JwtPayload } from '@app/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateProfileGatewayDto } from './dto/update-profile-gateway.dto';
import { ApplyMembershipGatewayDto } from './dto/apply-membership-gateway.dto';
import { ReviewMembershipGatewayDto } from './dto/review-membership-gateway.dto';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userClient: ClientProxy,
  ) {}

  // ─────────────────────────────────────────────────────────
  // PUBLIC ROUTES (No auth required)
  // ─────────────────────────────────────────────────────────

  // ── Apply for Expert Membership (Public) ──────────────────
  @Post('membership/apply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Apply for expert membership — open to everyone, ' + 'no login required',
  })
  @ApiResponse({
    status: 201,
    description: 'Membership application submitted successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Application with this email already exists',
  })
  async applyForMembership(
    @Body() applyMembershipDto: ApplyMembershipGatewayDto,
  ) {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.APPLY_MEMBERSHIP, applyMembershipDto),
    );
  }

  // ─────────────────────────────────────────────────────────
  // MEMBER ROUTES (Login required)
  // ─────────────────────────────────────────────────────────

  // ── Get My Profile ─────────────────────────────────────────
  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile returned' })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.GET_PROFILE, {
        userId: user.sub,
      }),
    );
  }

  // ── Update My Profile ──────────────────────────────────────
  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: UpdateProfileGatewayDto,
  ) {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.UPDATE_PROFILE, {
        userId: user.sub,
        updateDto,
      }),
    );
  }

  // ── Get My Membership Application Status ──────────────────
  @Get('membership/my-application')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my membership application status',
  })
  @ApiResponse({ status: 200, description: 'Application returned' })
  async getMyMembership(@CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.GET_MEMBERSHIP, {
        userId: user.sub,
      }),
    );
  }

  // ─────────────────────────────────────────────────────────
  // ADMIN ROUTES
  // ─────────────────────────────────────────────────────────

  // ── Get All Users (Admin) ──────────────────────────────────
  @Get('members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all registered users — Admin only' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllMembers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.GET_ALL_MEMBERS, {
        page: Number(page),
        limit: Number(limit),
      }),
    );
  }

  // ── Get User By ID (Admin) ─────────────────────────────────
  @Get('members/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific user — Admin only' })
  async getMemberById(@Param('userId') userId: string) {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.GET_PROFILE, { userId }),
    );
  }

  // ── Update Member Status (Super Admin) ────────────────────
  @Patch('members/:userId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update member account status — Super Admin only',
  })
  async updateMemberStatus(
    @Param('userId') userId: string,
    @Body() body: { status: string },
  ) {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.UPDATE_STATUS, {
        userId,
        status: body.status,
      }),
    );
  }

  // ── Get All Membership Applications (Admin) ───────────────
  @Get('membership/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all expert membership applications — Admin only',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
  })
  async getAllMembershipApplications(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ) {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.GET_ALL_APPLICATIONS, {
        page: Number(page),
        limit: Number(limit),
        status,
      }),
    );
  }

  // ── Review a Membership Application (Admin) ───────────────
  @Patch('membership/applications/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Review a membership application — Admin only',
  })
  @ApiResponse({ status: 200, description: 'Application reviewed' })
  async reviewMembershipApplication(
    @Param('id') id: string,
    @Body() reviewDto: ReviewMembershipGatewayDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.REVIEW_MEMBERSHIP, {
        id,
        updateDto: {
          ...reviewDto,
          reviewedBy: admin.sub,
        },
      }),
    );
  }

  // ── Get Membership Stats (Admin Dashboard) ─────────────────
  @Get('membership/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get membership application statistics — Admin only',
  })
  async getMembershipStats() {
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.GET_MEMBERSHIP_STATS, {}),
    );
  }
}
