import { Base } from "../shared/domain/base";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import {
  Role,
  Gender,
  Experience,
  PlayingStyle,
  CourtTypePreference,
  PlayerGoals,
  DominantHand,
  GamePreference,
} from "./domain/user";

@Entity('users')
export class User implements Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column()
  password: string;

  @Column({ name: 'phone_number', unique: true, nullable: true })
  phoneNumber: string;

  @Column({ name: 'phone_verified', default: false })
  phoneVerified: boolean;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl: string;

  @Column({ type: 'enum', enum: Role, default: Role.PLAYER })
  role: Role;

  @Column({ type: 'enum', enum: Gender, default: Gender.MALE })
  gender: Gender;

  @Column({ default: 18 })
  age: number;

  @Column({ type: 'enum', enum: Experience, default: Experience.BEGGINER })
  experience: Experience;

  @Column({ name: 'playing_time', default: 0 })
  playingTime: number;

  @Column({ name: 'playing_style', type: 'enum', enum: PlayingStyle, default: PlayingStyle.NONE })
  playingStyle: PlayingStyle;

  @Column({ name: 'court_type_preference', type: 'enum', enum: CourtTypePreference, default: CourtTypePreference.HARD })
  courtTypePreference: CourtTypePreference;

  @Column({ name: 'games_per_week', default: 0 })
  gamesPerWeek: number;

  @Column({ name: 'player_goals', type: 'enum', enum: PlayerGoals, default: PlayerGoals.NONE })
  playerGoals: PlayerGoals;

  @Column({ name: 'dominant_hand', type: 'enum', enum: DominantHand, default: DominantHand.RIGHT })
  dominantHand: DominantHand;

  @Column({ name: 'game_preference', type: 'enum', enum: GamePreference, default: GamePreference.SINGLES })
  gamePreference: GamePreference;

  @Column({ default: 'active' })
  status: string;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastLoginAt: Date;

  @Column({ name: 'activation_code', nullable: true })
  activationCode: string;

  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken: string;

  @Column({ name: 'reset_password_expires', type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'login_attempts', default: 0 })
  loginAttempts: number;

  @Column({ name: 'lock_until', type: 'timestamp', nullable: true })
  lockUntil: Date;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}