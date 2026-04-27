import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewMembershipGatewayDto {
  @ApiPropertyOptional({
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    example: 'approved',
  })
  @IsEnum(['pending', 'under_review', 'approved', 'rejected'])
  status!: string;

  @ApiPropertyOptional({
    example: 'Excellent background in software engineering.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}
