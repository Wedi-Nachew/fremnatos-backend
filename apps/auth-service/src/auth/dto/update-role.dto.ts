import { IsEnum, IsString } from 'class-validator';
import { Role } from '@app/common';

export class UpdateRoleDto {
  @IsString()
  userId!: string;

  @IsEnum(Role)
  role!: Role;
}
