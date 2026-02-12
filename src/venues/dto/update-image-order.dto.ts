import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateImageOrderDto {
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  displayOrder: number;
}
