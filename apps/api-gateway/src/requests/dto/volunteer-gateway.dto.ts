import {
  IsEmail,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VolunteerGatewayDto {
  @ApiProperty({ example: 'Tigist Alemu' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({ example: 'tigist@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+251911234567' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'Mekelle' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Nurse' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  occupation!: string;

  @ApiProperty({
    example: ['Monday', 'Wednesday', 'Friday'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  availableDays!: string[];

  @ApiProperty({
    enum: ['children', 'elderly', 'mental_health', 'events', 'admin', 'any'],
    example: 'children',
  })
  @IsEnum(['children', 'elderly', 'mental_health', 'events', 'admin', 'any'])
  preferredArea!: string;

  @ApiPropertyOptional({
    example: 'I am passionate about helping children...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  motivation?: string;
}
