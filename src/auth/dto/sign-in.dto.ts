import { IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  readonly emailPhone: string;

  @IsNotEmpty()
  readonly password: string;
}
