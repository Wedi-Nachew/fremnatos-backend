import { Role } from '../enums/roles.enum';

export interface IUser {
  id: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
}
