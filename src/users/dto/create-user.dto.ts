import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { IsEmailUnique } from '../validators/is-email-unique.decorator';
import { Role } from '../domain/user';

export class CreateUserDto {
  @IsEmail()
  @IsEmailUnique()
  readonly email: string;

  @IsStrongPassword()
  readonly password: string;

  @IsOptional()
  @IsString()
  readonly phoneNumber?: string;

  @IsString()
  readonly fullName: string;

  @IsEnum(Object.values(Role))
  readonly role: Role;
}
