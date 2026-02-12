import { IsNotEmpty, IsString, IsEnum, IsOptional, Matches } from 'class-validator';
import { AvailabilityType } from '../entities/court-availability.entity';

export class CreateCourtAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe estar en formato YYYY-MM-DD',
  })
  date: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime debe estar en formato HH:MM',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime debe estar en formato HH:MM',
  })
  endTime: string;

  @IsEnum(AvailabilityType)
  @IsNotEmpty()
  type: AvailabilityType;

  @IsString()
  @IsOptional()
  reason?: string;
}
