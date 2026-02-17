import { IsEnum, IsOptional, IsString, Matches, IsUUID } from 'class-validator';
import { AttendanceStatus } from '../entities/class-session-attendance.entity';

export class FindMyClassSessionsDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fromDate debe tener formato YYYY-MM-DD',
  })
  fromDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'toDate debe tener formato YYYY-MM-DD',
  })
  toDate?: string;

  @IsOptional()
  @IsUUID('4', { message: 'courseId debe ser un UUID válido' })
  courseId?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus, {
    message: 'attendanceStatus debe ser PRESENT o ABSENT',
  })
  attendanceStatus?: AttendanceStatus;
}
