import {
  IsEmail,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsUrl,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFundraiseDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  campaignTitle!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50, {
    message: 'Campaign description must be at least 50 characters',
  })
  @MaxLength(5000)
  campaignDescription!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  targetAmount?: number;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsUrl()
  campaignLink?: string;
}
