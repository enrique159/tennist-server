import { IsNotEmpty, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { VenueType } from '../venue.entity';
import { BaseStatus } from '@/shared/domain/status';

export class FindNearbyVenuesDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  lat: number;

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
}
