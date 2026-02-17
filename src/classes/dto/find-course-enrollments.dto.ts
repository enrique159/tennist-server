import { IsEnum, IsOptional } from 'class-validator';
import { EnrollmentStatus } from '../entities/course-enrollment.entity';

export class FindCourseEnrollmentsDto {
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}
