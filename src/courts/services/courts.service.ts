import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Court } from '../entities/court.entity';
import { Venue } from '@/venues/venue.entity';
import { CreateCourtDto } from '../dto/create-court.dto';
import { Role } from '@/users/domain/user';

@Injectable()
export class CourtsService {
  constructor(
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  /**
   * @description Crea una cancha en un venue específico
   * @param { string } venueId - ID del venue donde se creará la cancha
   * @param { CreateCourtDto } createCourtDto - Datos de la cancha a crear
   * @param { any } currentUser - Usuario actual que realiza la acción
   * @returns { Promise<Court> } Cancha creada
   */
  async createCourt(venueId: string, createCourtDto: CreateCourtDto, currentUser: any): Promise<Court> {
    const venue = await this.venueRepository.findOne({ where: { id: venueId } });

    if (!venue) {
      throw new NotFoundException(`Venue con ID ${venueId} no encontrado`);
    }

    if (currentUser.role !== Role.ADMIN && venue.ownerUserId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para crear canchas en este venue');
    }

    const court = this.courtRepository.create({
      ...createCourtDto,
      venueId,
      isActive: true,
    });

    return await this.courtRepository.save(court);
  }

  /**
   * @description Obtiene todas las canchas de un venue
   * @param { string } venueId - ID del venue
   * @returns { Promise<Court[]> } Lista de canchas del venue
   */
  async findCourtsByVenue(venueId: string): Promise<Court[]> {
    const venue = await this.venueRepository.findOne({ where: { id: venueId } });

    if (!venue) {
      throw new NotFoundException(`Venue con ID ${venueId} no encontrado`);
    }

    return await this.courtRepository.find({
      where: { venueId },
      relations: ['venue'],
    });
  }
}
