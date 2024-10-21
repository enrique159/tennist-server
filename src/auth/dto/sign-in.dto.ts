import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  readonly password: string;
}
