import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  Matches,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { VenueType } from '../venue.entity';

export class CreateVenueDto {
  @IsString()
  @IsOptional()
  @MaxLength(24)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'El alias solo puede contener letras, números, guion medio y guion bajo',
  })
  alias?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @IsEnum(VenueType)
  @IsNotEmpty()
  type: VenueType;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'El enlace de Facebook no es válido' })
  facebook?: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'El enlace de Instagram no es válido' })
  instagram?: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'El enlace URL no es válido' })
  url?: string;
}
