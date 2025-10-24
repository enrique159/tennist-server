/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UsersService } from '../users.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsPhoneNumberUniqueConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly userService: UsersService) {}

  async validate(
    phoneNumber: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const user = await this.userService.findByPhoneNumber(phoneNumber);
    return !user; // Retorna true si el email no existe
  }

  defaultMessage(args: ValidationArguments): string {
    return 'El teléfono $value ya está en uso.';
  }
}
