import { IsNotEmpty, IsInt, Min, Max, IsString, Matches } from 'class-validator';

export class CreateCourtScheduleDto {
  @IsInt()
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  dayOfWeek: number;

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
}
