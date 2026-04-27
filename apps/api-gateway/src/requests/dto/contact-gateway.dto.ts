import {
  IsEmail,
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactGatewayDto {
  @ApiProperty({ example: 'Meron Tesfaye' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({ example: 'meron@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+251911234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Inquiry about volunteering' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  subject!: string;

  @ApiProperty({
    example: 'I would like to learn more about how I can volunteer...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(5000)
  message!: string;
}
