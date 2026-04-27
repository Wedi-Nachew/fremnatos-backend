import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipRequestService } from './membership-request.service';
import { MembershipRequest } from '../entities/membership-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipRequest])],
  providers: [MembershipRequestService],
  exports: [MembershipRequestService],
})
export class MembershipRequestModule {}
