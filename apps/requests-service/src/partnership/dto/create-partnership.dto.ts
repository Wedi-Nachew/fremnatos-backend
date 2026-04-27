import {
  IsEmail,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreatePartnershipDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  organizationName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  contactPersonName!: string;

  @IsEmail()
  contactEmail!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @IsEnum(['financial', 'in_kind', 'technical', 'media', 'other'], {
    message:
      'Partnership type must be: financial, in_kind, ' +
      'technical, media, or other',
  })
  partnershipType!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50, {
    message: 'Proposal details must be at least 50 characters',
  })
  @MaxLength(5000)
  proposalDetails!: string;
}
