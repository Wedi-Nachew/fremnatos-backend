import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RequestsController } from './requests.controller';
import { AUTH_SERVICE, REQUESTS_SERVICE } from '@app/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: REQUESTS_SERVICE,
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3004 },
      },
      {
        name: AUTH_SERVICE,
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3001 },
      },
    ]),
  ],
  controllers: [RequestsController],
  providers: [JwtAuthGuard, RolesGuard],
})
export class RequestsModule {}
