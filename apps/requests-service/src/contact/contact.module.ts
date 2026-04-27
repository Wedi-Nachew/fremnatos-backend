import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { ContactRequest } from '../entities/contact-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactRequest])],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
