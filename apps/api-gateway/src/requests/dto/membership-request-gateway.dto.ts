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

export class MembershipRequestGatewayDto {
  @ApiProperty({ example: 'Selam Hailu' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({ example: 'selam@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+251911234567' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'Adigrat' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({
    enum: ['individual', 'family', 'corporate'],
    example: 'individual',
  })
  @IsEnum(['individual', 'family', 'corporate'])
  membershipCategory!: string;

  @ApiPropertyOptional({ example: 'Teacher' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @ApiPropertyOptional({
    example: 'I want to support the children program...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reasonForJoining?: string;
}
