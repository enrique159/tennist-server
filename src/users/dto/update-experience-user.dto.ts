import { IsEnum, IsOptional } from 'class-validator';
import {
  CourtTypePreference,
  DominantHand,
  Experience,
  GamePreference,
  Gender,
  PlayerGoals,
  PlayingStyle,
  Role,
} from '../domain/user';

export class UpdateExperienceUserDto {
  @IsOptional()
  @IsEnum(Object.values(Role))
  readonly role: Role;

  @IsOptional()
  @IsEnum(Object.values(Gender))
  gender?: Gender;

  @IsOptional()
  age?: number;

  @IsOptional()
  @IsEnum(Object.values(Experience))
  readonly experience: Experience;

  @IsOptional()
  playingTime?: number;

  @IsOptional()
  @IsEnum(Object.values(PlayingStyle))
  playingStyle?: PlayingStyle;

  @IsOptional()
  @IsEnum(Object.values(CourtTypePreference))
  courtTypePreference?: CourtTypePreference;

  @IsOptional()
  gamesPerWeek?: number;

  @IsOptional()
  @IsEnum(Object.values(PlayerGoals))
  playerGoals?: PlayerGoals;

  @IsOptional()
  @IsEnum(Object.values(DominantHand))
  dominantHand?: DominantHand;

  @IsOptional()
  @IsEnum(Object.values(GamePreference))
  gamePreference?: GamePreference;
}
