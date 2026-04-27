import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RequestStatus } from '@app/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRequestStatusGatewayDto {
  @ApiProperty({ enum: RequestStatus, example: 'approved' })
  @IsEnum(RequestStatus)
  status!: RequestStatus;

  @ApiPropertyOptional({
    example: 'Reviewed and approved. Will be contacted soon.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}
