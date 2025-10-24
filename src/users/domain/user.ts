import { Base } from '@/shared/domain/base';

interface Users {
  users: User[];
}

export interface UserToken {
  id: string;
  email: string;
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
  role?: Role;
  gender?: Gender;
  age?: number; // Edad en años
  experience?: Experience;
  playingTime?: number; // Tiempo jugado en meses
  playingStyle?: PlayingStyle;
  courtTypePreference?: CourtTypePreference;
  gamesPerWeek?: number; // Juegos jugados por semana
  playerGoals?: PlayerGoals;
  dominantHand?: DominantHand;
  gamePreference?: GamePreference;
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
  PLAYER = 'player',
  COACH = 'coach',
  COURT_OWNER = 'court_owner',
  ADMIN = 'admin',
}

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

enum Experience {
  BEGGINER = 'begginer',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PRO = 'pro',
}

enum PlayingStyle {
  DEFENSIVE = 'defensive',
  AGRESSIVE = 'aggressive',
  GENERAL = 'general',
  NONE = 'none',
}

enum CourtTypePreference {
  CLAY = 'clay',
  GRASS = 'grass',
  HARD = 'hard',
}

enum PlayerGoals {
  COMPETITIVE = 'competitive',
  RECREATIONAL = 'recreational',
  FITNESS = 'fitness',
  NONE = 'none',
}

enum GamePreference {
  SINGLES = 'singles',
  DOUBLES = 'doubles',
}

enum DominantHand {
  LEFT = 'left',
  RIGHT = 'right',
  BOTH = 'both',
}

export {
  Users,
  User,
  Role,
  Gender,
  Experience,
  PlayingStyle,
  CourtTypePreference,
  PlayerGoals,
  DominantHand,
  GamePreference,
};
