import { Module } from '@nestjs/common';
import { MemberManagementController } from './member-management.controller';
import { MemberManagementService } from './member-management.service';

@Module({
  controllers: [MemberManagementController],
  providers: [MemberManagementService]
})
export class MemberManagementModule {}
