import {
  ArrayMaxSize,
  IsArray,
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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CourseDifficulty, CourseStatus } from '../entities/course.entity';

export class CreateCourseScheduleDto {
  @IsInt()
  @Min(0, { message: 'dayOfWeek debe estar entre 0 y 6' })
  @Max(6, { message: 'dayOfWeek debe estar entre 0 y 6' })
  dayOfWeek: number;

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
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120, { message: 'El título no puede superar 120 caracteres' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'La descripción no puede superar 2000 caracteres' })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80, { message: 'El nombre de grupo no puede superar 80 caracteres' })
  groupName?: string;

  @IsOptional()
  @IsEnum(CourseDifficulty, {
    message: 'difficulty debe ser BEGINNER, INTERMEDIATE, ADVANCED o ALL_LEVELS',
  })
  difficulty?: CourseDifficulty;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'El cupo mínimo es 1' })
  @Max(500, { message: 'El cupo máximo es 500' })
  maxCapacity?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate debe tener formato YYYY-MM-DD',
  })
  startDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate debe tener formato YYYY-MM-DD',
  })
  endDate?: string;

  @IsOptional()
  @IsEnum(CourseStatus, {
    message: 'status debe ser DRAFT, ACTIVE, FINISHED o CANCELLED',
  })
  status?: CourseStatus;

  @IsOptional()
  @IsUUID('4', { message: 'venueId debe ser un UUID válido' })
  venueId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7, { message: 'Un curso puede tener máximo 7 horarios por semana' })
  @ValidateNested({ each: true })
  @Type(() => CreateCourseScheduleDto)
  schedules?: CreateCourseScheduleDto[];
}
