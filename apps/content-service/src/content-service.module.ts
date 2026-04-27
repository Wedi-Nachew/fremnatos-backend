import { Module } from '@nestjs/common';
import { ContentServiceController } from './content-service.controller';
import { ContentServiceService } from './content-service.service';
import { PostsModule } from './posts/posts.module';
import { EventsModule } from './events/events.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [PostsModule, EventsModule, CommentsModule],
  controllers: [ContentServiceController],
  providers: [ContentServiceService],
})
export class ContentServiceModule {}
