import { Base } from '@/shared/domain/base';

interface Users {
  users: User[];
}

interface User extends Base {
  username: string;
  email: string;
  emailVerified: boolean;
  password: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  fullName: string;
  profileImageUrl?: string;
  role: Role;
  status: string;
  isDeleted: boolean;
  lastLoginAt?: Date;
  activationCode?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lockUntil?: Date;
}

enum Role {
  player = 'player',
  coach = 'coach',
  courtOwner = 'court_owner',
  admin = 'admin',
}

export { Users, User, Role };
