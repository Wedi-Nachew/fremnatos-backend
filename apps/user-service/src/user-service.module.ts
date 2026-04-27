import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { MembershipModule } from './membership/membership.module';
import { User } from './entities/user.entity';
import { Membership } from './entities/membership.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/user-service/.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('USER_DB_HOST'),
        port: configService.get<number>('USER_DB_PORT'),
        username: configService.get<string>('USER_DB_USER'),
        password: configService.get<string>('USER_DB_PASS'),
        database: configService.get<string>('USER_DB_NAME'),
        entities: [User, Membership],
        synchronize: true, // ⚠️ Set false in production
        logging: true,
      }),
    }),

    UsersModule,
    MembershipModule,
  ],
})
export class AppModule {}