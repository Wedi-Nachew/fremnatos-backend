import { Module } from '@nestjs/common';
import { ContentModerationController } from './content-moderation.controller';
import { ContentModerationService } from './content-moderation.service';

@Module({
  controllers: [ContentModerationController],
  providers: [ContentModerationService]
})
export class ContentModerationModule {}
