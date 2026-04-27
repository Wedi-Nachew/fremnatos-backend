import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnershipService } from './partnership.service';
import { PartnershipRequest } from '../entities/partnership-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartnershipRequest])],
  providers: [PartnershipService],
  exports: [PartnershipService],
})
export class PartnershipModule {}
