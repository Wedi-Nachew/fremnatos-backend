import {
  IsEmail,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PartnershipGatewayDto {
  @ApiProperty({ example: 'ABC Foundation' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  organizationName!: string;

  @ApiProperty({ example: 'Yonas Berhe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  contactPersonName!: string;

  @ApiProperty({ example: 'yonas@abcfoundation.org' })
  @IsEmail()
  contactEmail!: string;

  @ApiPropertyOptional({ example: '+251911234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://abcfoundation.org' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @ApiProperty({
    enum: ['financial', 'in_kind', 'technical', 'media', 'other'],
    example: 'financial',
  })
  @IsEnum(['financial', 'in_kind', 'technical', 'media', 'other'])
  partnershipType!: string;

  @ApiProperty({
    example: 'We propose a financial partnership to fund...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(5000)
  proposalDetails!: string;
}
