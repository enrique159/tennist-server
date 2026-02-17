import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EnrollmentStatus } from '../entities/course-enrollment.entity';

export class ReviewEnrollmentDto {
  @IsEnum(EnrollmentStatus, {
    message: 'status debe ser APPROVED o REJECTED',
  })
  status: EnrollmentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'reviewNotes no puede superar 500 caracteres' })
  reviewNotes?: string;
}
