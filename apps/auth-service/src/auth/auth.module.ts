import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategies';
import { AuthCredential } from '../entities/auth-credential.entity';
import { NOTIFICATION_SERVICE } from '@app/common/constants/services.constants';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthCredential]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN') as
            | `${number}m`
            | `${number}d`
            | `${number}h`
            | `${number}s`,
        },
      }),
    }),
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

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
