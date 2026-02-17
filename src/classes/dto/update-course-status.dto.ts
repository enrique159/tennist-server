import { IsEnum } from 'class-validator';
import { CourseStatus } from '../entities/course.entity';

export class UpdateCourseStatusDto {
  @IsEnum(CourseStatus, {
    message: 'status debe ser DRAFT, ACTIVE, FINISHED o CANCELLED',
  })
  status: CourseStatus;
}
