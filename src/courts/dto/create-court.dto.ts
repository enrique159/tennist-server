import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { CourtSurface } from '../entities/court.entity';

export class CreateCourtDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CourtSurface)
  @IsNotEmpty()
  surface: CourtSurface;

  @IsBoolean()
  @IsOptional()
  isIndoor?: boolean;

  @IsBoolean()
  @IsOptional()
  isLighted?: boolean;
}
