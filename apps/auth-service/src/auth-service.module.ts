import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AuthCredential } from './entities/auth-credential.entity';

@Module({
  imports: [
    // Load .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/auth-service/.env',
    }),

    // PostgreSQL Connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('AUTH_DB_HOST'),
        port: configService.get<number>('AUTH_DB_PORT'),
        username: configService.get<string>('AUTH_DB_USER'),
        password: configService.get<string>('AUTH_DB_PASS'),
        database: configService.get<string>('AUTH_DB_NAME'),
        entities: [AuthCredential],
        synchronize: true, // ⚠️ Set to false in production
        logging: true,
      }),
    }),

    AuthModule,
  ],
})
export class AppModule {}
