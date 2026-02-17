import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../entities/class-session-attendance.entity';

export class CreateClassSessionAttendanceDto {
  @IsUUID('4', { message: 'userId debe ser un UUID válido' })
  userId: string;

  @IsOptional()
  @IsEnum(AttendanceStatus, {
    message: 'attendance status debe ser PRESENT o ABSENT',
  })
  status?: AttendanceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'playerNotes no puede superar 500 caracteres' })
  playerNotes?: string;
}

export class CreateClassSessionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe tener formato YYYY-MM-DD',
  })
  date: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'startTime debe tener formato HH:MM',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'endTime debe tener formato HH:MM',
  })
  endTime: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'generalNotes no puede superar 2000 caracteres' })
  generalNotes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200, { message: 'attendance soporta máximo 200 jugadores' })
  @ValidateNested({ each: true })
  @Type(() => CreateClassSessionAttendanceDto)
  attendance?: CreateClassSessionAttendanceDto[];
}
