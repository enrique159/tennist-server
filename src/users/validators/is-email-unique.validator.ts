/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UserService } from '../user.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(email: string, args: ValidationArguments): Promise<boolean> {
    const user = await this.userService.findByEmail(email);
    return !user; // Retorna true si el email no existe
  }

  defaultMessage(args: ValidationArguments): string {
    return 'El correo electrónico $value ya está en uso.';
  }
}
