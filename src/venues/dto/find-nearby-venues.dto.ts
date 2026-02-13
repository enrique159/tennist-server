import { IsNotEmpty, IsNumber, IsOptional, IsEnum, IsBoolean, Min, Max, ValidateIf } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { VenueType } from '../venue.entity';
import { BaseStatus } from '@/shared/domain/status';

export class FindNearbyVenuesDto {
  @ValidateIf((o) => !o.all)
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  lat: number;

  @ValidateIf((o) => !o.all)
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  lng: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0.1)
  @Max(100)
  radiusKm?: number = 10;

  @IsEnum(VenueType)
  @IsOptional()
  type?: VenueType;

  @IsEnum(BaseStatus)
  @IsOptional()
  status?: BaseStatus;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  all?: boolean = false;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
