import {
  IsEmail,
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateContactDto {
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
  @MinLength(3)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20, {
    message: 'Message must be at least 20 characters',
  })
  @MaxLength(5000)
  message!: string;
}
