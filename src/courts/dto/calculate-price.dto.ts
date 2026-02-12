import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class CalculatePriceDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  durationMinutes: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  playersCount: number;
}
