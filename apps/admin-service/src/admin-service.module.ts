import { Module } from '@nestjs/common';
import { AdminServiceController } from './admin-service.controller';
import { AdminServiceService } from './admin-service.service';
import { RequestManagementModule } from './request-management/request-management.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MemberManagementModule } from './member-management/member-management.module';
import { ContentModerationModule } from './content-moderation/content-moderation.module';

@Module({
  imports: [RequestManagementModule, DashboardModule, MemberManagementModule, ContentModerationModule],
  controllers: [AdminServiceController],
  providers: [AdminServiceService],
})
export class AdminServiceModule {}
