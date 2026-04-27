import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsModule } from './requests.module';
import { ContactRequest } from './entities/contact-request.entity';
import { PartnershipRequest } from './entities/partnership-request.entity';
import { VolunteerRequest } from './entities/volunteer-request.entity';
import { FundraiseRequest } from './entities/fundraise-request.entity';
import { MembershipRequest } from './entities/membership-request.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/requests-service/.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('REQUESTS_DB_HOST'),
        port: configService.get<number>('REQUESTS_DB_PORT'),
        username: configService.get<string>('REQUESTS_DB_USER'),
        password: configService.get<string>('REQUESTS_DB_PASS'),
        database: configService.get<string>('REQUESTS_DB_NAME'),
        entities: [
          ContactRequest,
          PartnershipRequest,
          VolunteerRequest,
          FundraiseRequest,
          MembershipRequest,
        ],
        synchronize: true, // ⚠️ Set false in production
        logging: true,
      }),
    }),

    RequestsModule,
  ],
})
export class AppModule {}
