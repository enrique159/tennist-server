import { SetMetadata } from '@nestjs/common';
import { Role } from '@/users/domain/user';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
