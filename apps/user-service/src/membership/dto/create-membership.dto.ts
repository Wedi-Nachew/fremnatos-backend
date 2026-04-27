import {
  IsString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateMembershipDto {
  // Optional: If the applicant is a registered user
  @IsOptional()
  @IsUUID()
  userId?: string;

  // ── Personal Information ────────────────────────────────
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  // ── Professional Details ────────────────────────────────
  @IsString()
  @IsNotEmpty({ message: 'Primary expertise is required' })
  @MaxLength(100)
  primaryExpertise!: string;

  @IsInt()
  @Min(0, { message: 'Years of experience cannot be negative' })
  @Max(60, { message: 'Years of experience seems too high' })
  yearsOfExperience!: number;

  @IsString()
  @IsNotEmpty({ message: 'Current role or organization is required' })
  @MaxLength(150)
  currentRole!: string;

  // ── Availability ─────────────────────────────────────────
  @IsInt()
  @Min(1, { message: 'Availability must be at least 1 hour per week' })
  @Max(168, { message: 'Availability cannot exceed 168 hours per week' })
  availabilityHoursPerWeek!: number;

  // ── Contribution Description ──────────────────────────────
  @IsString()
  @IsNotEmpty({ message: 'Please describe your contribution' })
  @MinLength(50, {
    message: 'Contribution note must be at least 50 characters',
  })
  @MaxLength(2000, {
    message: 'Contribution note must not exceed 2000 characters',
  })
  contributionNote!: string;
}
