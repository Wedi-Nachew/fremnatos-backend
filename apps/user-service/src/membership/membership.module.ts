import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { Membership } from '../entities/membership.entity';
import { User } from '../entities/user.entity';
import { NOTIFICATION_SERVICE } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Membership, User]),
    // Register Notification Service client
    ClientsModule.register([
      {
        name: NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3006,
        },
      },
    ]),
  ],
  controllers: [MembershipController],
  providers: [MembershipService],
  exports: [MembershipService],
})
export class MembershipModule {}
