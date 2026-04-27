import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMembershipDto {
  @IsOptional()
  @IsEnum(['pending', 'under_review', 'approved', 'rejected'], {
    message: 'Status must be pending, under_review, approved, or rejected',
  })
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;

  @IsOptional()
  @IsString()
  reviewedBy?: string;
}
