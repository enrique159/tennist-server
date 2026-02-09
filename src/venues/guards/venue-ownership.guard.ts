import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from '../venue.entity';
import { Role } from '@/users/domain/user';

@Injectable()
export class VenueOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const venueId = request.params.venueId || request.params.id;

    if (!venueId) {
      throw new ForbiddenException('ID del venue no proporcionado');
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    const venue = await this.venueRepository.findOne({ where: { id: venueId } });

    if (!venue) {
      throw new NotFoundException('Venue no encontrado');
    }

    if (venue.ownerUserId !== user.id) {
      throw new ForbiddenException('No eres propietario de este venue');
    }

    return true;
  }
}
