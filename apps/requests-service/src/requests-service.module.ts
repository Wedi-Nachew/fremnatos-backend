import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { ContactModule } from './contact/contact.module';
import { PartnershipModule } from './partnership/partnership.module';
import { VolunteerModule } from './volunteer/volunteer.module';
import { FundraiseModule } from './fundraise/fundraise.module';
import { MembershipRequestModule } from './membership-request/membership-request.module';
import { NOTIFICATION_SERVICE } from '@app/common';

@Module({
  imports: [
    // Sub-modules
    ContactModule,
    PartnershipModule,
    VolunteerModule,
    FundraiseModule,
    MembershipRequestModule,

    // Notification client
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
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
