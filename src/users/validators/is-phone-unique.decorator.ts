import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsPhoneNumberUniqueConstraint } from './is-phone-unique.validator';

export function IsPhoneNumberUnique(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsPhoneUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsPhoneNumberUniqueConstraint,
    });
  };
}
