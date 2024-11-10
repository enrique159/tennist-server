import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { IsEmailUnique } from '../validators/is-email-unique.decorator';
import { IsPhoneNumberUnique } from '../validators/is-phone-unique.decorator';

export class CreateUserDto {
  @IsEmail()
  @IsEmailUnique()
  readonly email: string;

  @IsStrongPassword()
  readonly password: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumberUnique()
  readonly phoneNumber?: string;

  @IsString()
  readonly fullName: string;
}
