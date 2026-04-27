import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
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
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import {
  REQUESTS_SERVICE,
  REQUESTS_PATTERNS,
  Roles,
  CurrentUser,
  Role,
  JwtPayload,
  RequestStatus,
} from '@app/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ContactGatewayDto } from './dto/contact-gateway.dto';
import { PartnershipGatewayDto } from './dto/partnership-gateway.dto';
import { VolunteerGatewayDto } from './dto/volunteer-gateway.dto';
import { FundraiseGatewayDto } from './dto/fundraise-gateway.dto';
import { MembershipRequestGatewayDto } from './dto/membership-request-gateway.dto';
import { UpdateRequestStatusGatewayDto } from './dto/update-request-status-gateway.dto';

@ApiTags('Requests')
@Controller('api/requests')
export class RequestsController {
  constructor(
    @Inject(REQUESTS_SERVICE)
    private readonly requestsClient: ClientProxy,
  ) {}

  // ─────────────────────────────────────────────────────────
  // PUBLIC SUBMIT ROUTES
  // ─────────────────────────────────────────────────────────

  @Post('contact')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a contact inquiry — Public' })
  @ApiResponse({ status: 201, description: 'Inquiry submitted' })
  async submitContact(@Body() dto: ContactGatewayDto) {
    return firstValueFrom(
      this.requestsClient.send(REQUESTS_PATTERNS.SUBMIT_CONTACT, dto),
    );
  }

  @Post('partnership')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a partnership proposal — Public',
  })
  @ApiResponse({ status: 201, description: 'Proposal submitted' })
  async submitPartnership(@Body() dto: PartnershipGatewayDto) {
    return firstValueFrom(
      this.requestsClient.send(REQUESTS_PATTERNS.SUBMIT_PARTNERSHIP, dto),
    );
  }

  @Post('volunteer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a volunteer application — Public',
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted',
  })
  async submitVolunteer(@Body() dto: VolunteerGatewayDto) {
    return firstValueFrom(
      this.requestsClient.send(REQUESTS_PATTERNS.SUBMIT_VOLUNTEER, dto),
    );
  }

  @Post('fundraise')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a fundraising campaign request — Public',
  })
  @ApiResponse({ status: 201, description: 'Request submitted' })
  async submitFundraise(@Body() dto: FundraiseGatewayDto) {
    return firstValueFrom(
      this.requestsClient.send(REQUESTS_PATTERNS.SUBMIT_FUNDRAISE, dto),
    );
  }

  @Post('membership')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a community membership inquiry — Public',
  })
  @ApiResponse({ status: 201, description: 'Inquiry submitted' })
  async submitMembershipRequest(@Body() dto: MembershipRequestGatewayDto) {
    return firstValueFrom(
      this.requestsClient.send(REQUESTS_PATTERNS.SUBMIT_MEMBERSHIP, dto),
    );
  }

  // ─────────────────────────────────────────────────────────
  // ADMIN ROUTES
  // ─────────────────────────────────────────────────────────

  @Get(':type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all requests of a specific type — Admin only',
  })
  @ApiParam({
    name: 'type',
    enum: ['contact', 'partnership', 'volunteer', 'fundraise', 'membership'],
    example: 'contact',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: RequestStatus,
  })
  async getAll(
    @Param('type') type: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: RequestStatus,
  ) {
    return firstValueFrom(
      this.requestsClient.send(REQUESTS_PATTERNS.GET_ALL, {
        type,
        page: Number(page),
        limit: Number(limit),
        status,
      }),
    );
  }

  @Get(':type/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a specific request by ID — Admin only',
  })
  async getById(@Param('type') type: string, @Param('id') id: string) {
    return firstValueFrom(
      this.requestsClient.send(REQUESTS_PATTERNS.GET_BY_ID, {
        type,
        id,
      }),
    );
  }

  @Patch(':type/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update request status — Admin only',
  })
  async updateStatus(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() dto: UpdateRequestStatusGatewayDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    return firstValueFrom(
      this.requestsClient.send(REQUESTS_PATTERNS.UPDATE_STATUS, {
        type,
        id,
        updateDto: {
          ...dto,
          reviewedBy: admin.sub,
        },
      }),
    );
  }

  @Get('stats/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get aggregated stats for all request types — Admin only',
  })
  async getStats() {
    return firstValueFrom(
      this.requestsClient.send(REQUESTS_PATTERNS.GET_STATS, {}),
    );
  }
}
