import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AUTH_SERVICE, AUTH_PATTERNS } from '@app/common';

interface GatewayRequest {
  headers?: {
    authorization?: string;
  };
  user?: unknown;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<GatewayRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      // Call Auth Service to verify the token
      this.logger.log(`[canActivate] Sending VERIFY_TOKEN to auth-service`);
      const payload = await firstValueFrom(
        this.authClient.send<unknown, { token: string }>(
          AUTH_PATTERNS.VERIFY_TOKEN,
          { token },
        ),
      );
      this.logger.log(`[canActivate] Token verified for user: ${(payload as any)?.sub}`);

      // Attach user payload to request object
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error(
        `[canActivate] Token verification failed: ${error?.message || JSON.stringify(error)}`
      );
      throw new UnauthorizedException(
        'Invalid or expired token. Please log in again.',
      );
    }
  }

  private extractTokenFromHeader(request: GatewayRequest): string | null {
    const authHeader = request.headers?.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
