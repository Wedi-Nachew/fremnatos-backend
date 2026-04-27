import { Role } from '../enums/roles.enum';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: Role;
  iat?: number; // Issued at (added by JWT automatically)
  exp?: number; // Expiry (added by JWT automatically)
}
