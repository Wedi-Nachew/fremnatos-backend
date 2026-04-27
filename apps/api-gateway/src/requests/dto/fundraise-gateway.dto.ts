import {
  IsEmail,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FundraiseGatewayDto {
  @ApiProperty({ example: 'Haile Gebre' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({ example: 'haile@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+251911234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Run for Freminatos 2025' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  campaignTitle!: string;

  @ApiProperty({
    example:
      'I plan to organize a 5km charity run in Mekelle to raise funds...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(5000)
  campaignDescription!: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  targetAmount?: number;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiPropertyOptional({
    example: 'https://gofundme.com/my-campaign',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  campaignLink?: string;
}
