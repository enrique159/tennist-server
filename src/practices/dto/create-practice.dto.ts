import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { PracticeSourceType } from '../entities/player-practice.entity';

export class CreatePracticeDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha de práctica debe tener el formato YYYY-MM-DD',
  })
  practiceDate: string;

  @IsInt()
  @Min(1, { message: 'La duración mínima de práctica es 1 minuto' })
  @Max(600, { message: 'La duración máxima de práctica es 600 minutos' })
  durationMinutes: number;

  @IsOptional()
  @IsBoolean()
  playedFriendlyMatch?: boolean;

  @IsOptional()
  @IsBoolean()
  practicedServes?: boolean;

  @IsOptional()
  @IsUUID('4', { message: 'El venueId debe ser un UUID válido' })
  venueId?: string;

  @IsOptional()
  @IsEnum(PracticeSourceType, {
    message: 'El tipo de práctica debe ser MANUAL o CLASS',
  })
  sourceType?: PracticeSourceType;

  @ValidateIf((dto) => dto.sourceType === PracticeSourceType.CLASS)
  @IsBoolean({ message: 'Para prácticas de clase debes indicar asistencia' })
  classAttended?: boolean;

  @ValidateIf((dto) => dto.sourceType === PracticeSourceType.CLASS)
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El classId no puede superar 100 caracteres' })
  classId?: string;

  @ValidateIf((dto) => dto.sourceType === PracticeSourceType.CLASS)
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El classSessionId no puede superar 100 caracteres' })
  classSessionId?: string;

  @ValidateIf((dto) => dto.sourceType === PracticeSourceType.CLASS)
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'El nombre de la clase no puede superar 120 caracteres' })
  className?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Las notas no pueden superar 500 caracteres' })
  notes?: string;
}
