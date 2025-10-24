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
  readonly gender?: Gender;

  @IsOptional()
  readonly age?: number;

  @IsOptional()
  @IsEnum(Object.values(Experience))
  readonly experience: Experience;

  @IsOptional()
  readonly playingTime?: number;

  @IsOptional()
  @IsEnum(Object.values(PlayingStyle))
  readonly playingStyle?: PlayingStyle;

  @IsOptional()
  @IsEnum(Object.values(CourtTypePreference))
  readonly courtTypePreference?: CourtTypePreference;

  @IsOptional()
  readonly gamesPerWeek?: number;

  @IsOptional()
  @IsEnum(Object.values(PlayerGoals))
  readonly playerGoals?: PlayerGoals;

  @IsOptional()
  @IsEnum(Object.values(DominantHand))
  readonly dominantHand?: DominantHand;

  @IsOptional()
  @IsEnum(Object.values(GamePreference))
  readonly gamePreference?: GamePreference;
}
