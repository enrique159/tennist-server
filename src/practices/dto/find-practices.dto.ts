import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { PracticeSourceType } from '../entities/player-practice.entity';

export class FindPracticesDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fromDate debe tener el formato YYYY-MM-DD',
  })
  fromDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'toDate debe tener el formato YYYY-MM-DD',
  })
  toDate?: string;

  @IsOptional()
  @IsEnum(PracticeSourceType, {
    message: 'sourceType debe ser MANUAL o CLASS',
  })
  sourceType?: PracticeSourceType;
}
