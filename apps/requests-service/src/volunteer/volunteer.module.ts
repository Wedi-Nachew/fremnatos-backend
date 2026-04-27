import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerService } from './volunteer.service';
import { VolunteerRequest } from '../entities/volunteer-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VolunteerRequest])],
  providers: [VolunteerService],
  exports: [VolunteerService],
})
export class VolunteerModule {}
