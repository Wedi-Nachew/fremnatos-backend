import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { RequestStatus } from '@app/common';

export class UpdateRequestStatusDto {
  @IsEnum(RequestStatus, {
    message:
      'Status must be: pending, under_review, ' +
      'approved, rejected, or archived',
  })
  status!: RequestStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;

  @IsOptional()
  @IsUUID()
  reviewedBy?: string;
}
