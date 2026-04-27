import { Module } from '@nestjs/common';
import { RequestManagementController } from './request-management.controller';
import { RequestManagementService } from './request-management.service';

@Module({
  controllers: [RequestManagementController],
  providers: [RequestManagementService]
})
export class RequestManagementModule {}
