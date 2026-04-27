import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AuthCredential } from '../entities/auth-credential.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  Role,
  JwtPayload,
  NOTIFICATION_SERVICE,
  NOTIFICATION_EVENTS,
} from '@app/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(AuthCredential)
    private readonly authRepo: Repository<AuthCredential>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
  ) {}

  // ── Register ────────────────────────────────────────────────
  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;
    this.logger.log(`[register] Starting registration for email: ${email}`);

    // Check if email already exists
    const existing = await this.authRepo.findOne({ where: { email } });
    if (existing) {
      this.logger.warn(`[register] Email already exists: ${email}`);
      throw new ConflictException('An account with this email already exists');
    }
    this.logger.log(`[register] Email is available: ${email}`);

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const verificationToken = uuidv4();

    // Create and save the credential
    const credential = this.authRepo.create({
      email,
      password: hashedPassword,
      verificationToken,
      role: Role.MEMBER,
    });

    const saved = await this.authRepo.save(credential);
    this.logger.log(`[register] Credential saved with id: ${saved.id}`);

    // Generate tokens
    const tokens = await this.generateTokens(saved.id, saved.email, saved.role);
    this.logger.log(`[register] Tokens generated for user: ${saved.id}`);

    this.logger.log(`[register] Registration complete for user: ${saved.id}`);

    // 🔔 Emit welcome event to Notification Service
    // Fire and forget — does not block the response
    this.notificationClient.emit(NOTIFICATION_EVENTS.WELCOME, {
      email: saved.email,
      firstName,
      role: saved.role,
      verificationToken,
    });
    return {
      ...tokens,
      user: {
        id: saved.id,
        email: saved.email,
        role: saved.role,
        isEmailVerified: saved.isEmailVerified,
        firstName,
        lastName,
      },
      verificationToken, // returned so notification service can send email
    };
  }

  // ── Login ───────────────────────────────────────────────────
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    this.logger.log(`[login] Login attempt for email: ${email}`);

    // Find the credential
    const credential = await this.authRepo.findOne({ where: { email } });
    if (!credential) {
      this.logger.warn(`[login] No user found for email: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }
    this.logger.log(`[login] User found: ${credential.id}`);

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, credential.password);
    if (!isPasswordValid) {
      this.logger.warn(`[login] Invalid password for user: ${credential.id}`);
      throw new UnauthorizedException('Invalid email or password');
    }
    this.logger.log(`[login] Password valid for user: ${credential.id}`);

    // Generate tokens
    const tokens = await this.generateTokens(
      credential.id,
      credential.email,
      credential.role,
    );

    this.logger.log(`[login] Login successful for user: ${credential.id}`);
    return {
      ...tokens,
      user: {
        id: credential.id,
        email: credential.email,
        role: credential.role,
        isEmailVerified: credential.isEmailVerified,
      },
    };
  }

  // ── Logout ──────────────────────────────────────────────────
  async logout(userId: string) {
    this.logger.log(`[logout] Logout request for userId: ${userId}`);
    const credential = await this.authRepo.findOne({
      where: { id: userId },
    });

    if (!credential) {
      this.logger.warn(`[logout] User not found: ${userId}`);
      throw new NotFoundException('User not found');
    }
    this.logger.log(`[logout] User found: ${credential.id}`);

    // Invalidate refresh token by setting it to null
    await this.authRepo.update({ id: userId }, { refreshToken: undefined });
    this.logger.log(`[logout] Refresh token cleared for user: ${userId}`);

    return { message: 'Logged out successfully' };
  }

  // ── Verify Token ────────────────────────────────────────────
  async verifyToken(token: string): Promise<JwtPayload> {
    this.logger.log(
      `[verifyToken] Verifying token (first 20 chars): ${token?.substring(0, 20)}...`,
    );
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      this.logger.log(`[verifyToken] Token verified for user: ${payload.sub}`);

      // Check user still exists in DB
      const credential = await this.authRepo.findOne({
        where: { id: payload.sub },
      });

      if (!credential) {
        this.logger.warn(`[verifyToken] User no longer exists: ${payload.sub}`);
        throw new UnauthorizedException('User no longer exists');
      }
      this.logger.log(`[verifyToken] User exists: ${credential.id}`);

      this.logger.log(
        `[verifyToken] Returning payload for user: ${payload.sub}`,
      );
      return {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      this.logger.error(
        `[verifyToken] Verification failed: ${error?.message || JSON.stringify(error)}`,
      );
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // ── Refresh Token ────────────────────────────────────────────
  async refreshToken(refreshToken: string) {
    this.logger.log(
      `[refreshToken] Refreshing token (first 20 chars): ${refreshToken?.substring(0, 20)}...`,
    );
    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );
      this.logger.log(
        `[refreshToken] Refresh token verified for user: ${payload.sub}`,
      );

      // Find credential
      const credential = await this.authRepo.findOne({
        where: { id: payload.sub },
      });

      if (!credential || !credential.refreshToken) {
        this.logger.warn(
          `[refreshToken] No credential or refresh token found for user: ${payload.sub}`,
        );
        throw new UnauthorizedException(
          'Invalid refresh token. Please log in again.',
        );
      }
      this.logger.log(
        `[refreshToken] Credential found, checking stored refresh token`,
      );

      // Compare hashed refresh token
      const isRefreshValid = await bcrypt.compare(
        refreshToken,
        credential.refreshToken,
      );

      if (!isRefreshValid) {
        this.logger.warn(
          `[refreshToken] Refresh token mismatch for user: ${credential.id}`,
        );
        throw new UnauthorizedException(
          'Refresh token mismatch. Please log in again.',
        );
      }
      this.logger.log(
        `[refreshToken] Refresh token valid for user: ${credential.id}`,
      );

      // Issue new token pair (rotation)
      const tokens = await this.generateTokens(
        credential.id,
        credential.email,
        credential.role,
      );
      this.logger.log(
        `[refreshToken] New tokens issued for user: ${credential.id}`,
      );

      this.logger.log(
        `[refreshToken] Token refresh successful for user: ${credential.id}`,
      );
      return {
        ...tokens,
        user: {
          id: credential.id,
          email: credential.email,
          role: credential.role,
          isEmailVerified: credential.isEmailVerified,
        },
      };
    } catch (error) {
      this.logger.error(
        `[refreshToken] Token refresh failed: ${error?.message || JSON.stringify(error)}`,
      );
      throw new UnauthorizedException(
        'Invalid or expired refresh token. Please log in again.',
      );
    }
  }

  // ── Verify Email ────────────────────────────────────────────
  async verifyEmail(token: string) {
    this.logger.log(
      `[verifyEmail] Verifying email with token: ${token?.substring(0, 8)}...`,
    );
    const credential = await this.authRepo.findOne({
      where: { verificationToken: token },
    });

    if (!credential) {
      this.logger.warn(
        `[verifyEmail] No credential found for token: ${token?.substring(0, 8)}...`,
      );
      throw new BadRequestException('Invalid or expired verification link');
    }
    this.logger.log(`[verifyEmail] Credential found: ${credential.id}`);

    if (credential.isEmailVerified) {
      this.logger.log(
        `[verifyEmail] Email already verified for user: ${credential.id}`,
      );
      return { message: 'Email is already verified' };
    }

    await this.authRepo.update(
      { id: credential.id },
      {
        isEmailVerified: true,
        verificationToken: undefined,
      },
    );
    this.logger.log(`[verifyEmail] Email verified for user: ${credential.id}`);

    return { message: 'Email verified successfully' };
  }

  // ── Get User By ID ──────────────────────────────────────────
  async getUserById(userId: string) {
    this.logger.log(`[getUserById] Looking up user: ${userId}`);
    const credential = await this.authRepo.findOne({
      where: { id: userId },
    });

    if (!credential) {
      this.logger.warn(`[getUserById] User not found: ${userId}`);
      throw new NotFoundException('User not found');
    }

    // Never return the password or tokens
    const { password, refreshToken, ...safe } = credential;
    this.logger.log(`[getUserById] User found: ${credential.id}`);
    return safe;
  }

  // ── Update Role ─────────────────────────────────────────────
  async updateRole(userId: string, role: Role) {
    this.logger.log(
      `[updateRole] Updating role for user: ${userId} to ${role}`,
    );
    const credential = await this.authRepo.findOne({
      where: { id: userId },
    });

    if (!credential) {
      this.logger.warn(`[updateRole] User not found: ${userId}`);
      throw new NotFoundException('User not found');
    }

    await this.authRepo.update({ id: userId }, { role });
    this.logger.log(`[updateRole] Role updated for user: ${userId}`);

    return { message: `Role updated to ${role} successfully` };
  }

  // ── Private: Generate Token Pair ────────────────────────────
  private async generateTokens(userId: string, email: string, role: Role) {
    this.logger.log(`[generateTokens] Generating tokens for user: ${userId}`);
    const payload: JwtPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRES_IN') as
          | `${number}m`
          | `${number}d`
          | `${number}h`
          | `${number}s`,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_REFRESH_EXPIRES_IN',
        ) as `${number}m` | `${number}d` | `${number}h` | `${number}s`,
      }),
    ]);

    // Hash and save refresh token to DB (rotation)
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await this.authRepo.update(
      { id: userId },
      { refreshToken: hashedRefreshToken },
    );
    this.logger.log(
      `[generateTokens] Tokens generated and refresh token saved for user: ${userId}`,
    );

    return { accessToken, refreshToken };
  }
}
