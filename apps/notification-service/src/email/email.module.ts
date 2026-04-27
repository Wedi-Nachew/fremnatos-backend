import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

function resolveTemplateDir(): string {
  const candidates = [
    // webpack bundle output (__dirname = dist/apps/notification-service)
    join(__dirname, 'email', 'templates'),
    // standard Nest build output (__dirname = dist/apps/notification-service/src/email)
    join(__dirname, 'templates'),
    // explicit dist fallback
    join(
      process.cwd(),
      'dist',
      'apps',
      'notification-service',
      'email',
      'templates',
    ),
    // source fallback (works in local/dev and current Dockerfile layout)
    join(
      process.cwd(),
      'apps',
      'notification-service',
      'src',
      'email',
      'templates',
    ),
  ];

  return candidates.find((dir) => existsSync(dir)) ?? candidates[0];
}

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: false, // true for port 465, false for 587
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
        template: {
          dir: resolveTemplateDir(),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
