import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CourseDifficulty, CourseStatus } from '../entities/course.entity';

export class SearchCoursesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CourseDifficulty, {
    message: 'difficulty debe ser BEGINNER, INTERMEDIATE, ADVANCED o ALL_LEVELS',
  })
  difficulty?: CourseDifficulty;

  @IsOptional()
  @IsEnum(CourseStatus, {
    message: 'status debe ser DRAFT, ACTIVE, FINISHED o CANCELLED',
  })
  status?: CourseStatus;

  @IsOptional()
  @IsString()
  ownerUserId?: string;

  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
