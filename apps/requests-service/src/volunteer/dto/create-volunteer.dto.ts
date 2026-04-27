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

export class CreateVolunteerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  occupation!: string;

  @IsArray()
  @ArrayMinSize(1, {
    message: 'Please select at least one available day',
  })
  @IsString({ each: true })
  availableDays!: string[];

  @IsEnum(['children', 'elderly', 'mental_health', 'events', 'admin', 'any'], {
    message:
      'Preferred area must be one of: children, elderly, ' +
      'mental_health, events, admin, or any',
  })
  preferredArea!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  motivation?: string;

  @IsOptional()
  @IsString()
  cvUrl?: string;
}
