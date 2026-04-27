import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundraiseService } from './fundraise.service';
import { FundraiseRequest } from '../entities/fundraise-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FundraiseRequest])],
  providers: [FundraiseService],
  exports: [FundraiseService],
})
export class FundraiseModule {}
