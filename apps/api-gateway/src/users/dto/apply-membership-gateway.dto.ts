import {
  IsString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ApplyMembershipGatewayDto {
  @ApiProperty({
    example: 'Dawit Haile',
    description: 'Full name of the applicant',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    example: 'dawit@example.com',
    description: 'Email address of the applicant',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Software Engineering',
    description: 'Primary area of expertise',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  primaryExpertise: string;

  @ApiProperty({
    example: 5,
    description: 'Years of professional experience',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60)
  yearsOfExperience: number;

  @ApiProperty({
    example: 'Senior Software Engineer at ABC Company',
    description: 'Current role and organization',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  currentRole: string;

  @ApiProperty({
    example: 10,
    description: 'Number of hours available per week to contribute',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(168)
  availabilityHoursPerWeek: number;

  @ApiProperty({
    example:
      'I can help develop and maintain the backend systems, ' +
      'mentor junior developers, and assist with database design.',
    description: 'Describe what you can do and how you will contribute',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  @MaxLength(2000)
  contributionNote: string;
}
