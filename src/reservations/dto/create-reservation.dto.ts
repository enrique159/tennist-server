import { IsNotEmpty, IsInt, IsString, Matches, Min } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD',
  })
  date: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'La hora de inicio debe tener el formato HH:MM',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'La hora de fin debe tener el formato HH:MM',
  })
  endTime: string;

  @IsInt()
  @Min(1, { message: 'Debe haber al menos 1 jugador' })
  playersCount: number;
}
