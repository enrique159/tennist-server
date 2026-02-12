import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue, VenueType } from './venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { FindNearbyVenuesDto } from './dto/find-nearby-venues.dto';
import { BaseStatus } from '@/shared/domain/status';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  /**
   * @description Crea un venue público (solo para administradores)
   * @param { CreateVenueDto } createVenueDto - Datos del venue a crear
   * @returns { Promise<Venue> } Venue público creado
   */
  async createPublicVenue(createVenueDto: CreateVenueDto): Promise<Venue> {
    if (createVenueDto.type !== VenueType.PUBLIC) {
      throw new BadRequestException('Este método solo crea venues PÚBLICOS');
    }

    const venue = this.venueRepository.create({
      ...createVenueDto,
      createdByAdmin: true,
      ownerUserId: null,
      status: BaseStatus.ACTIVE,
    });

    return await this.venueRepository.save(venue);
  }

  /**
   * @description Crea un venue privado para un propietario específico
   * @param { CreateVenueDto } createVenueDto - Datos del venue a crear
   * @param { string } ownerUserId - ID del usuario propietario
   * @returns { Promise<Venue> } Venue privado creado
   */
  async createPrivateVenue(createVenueDto: CreateVenueDto, ownerUserId: string): Promise<Venue> {
    if (createVenueDto.type !== VenueType.PRIVATE) {
      throw new BadRequestException('Este método solo crea venues PRIVADOS');
    }

    if (!ownerUserId) {
      throw new BadRequestException('El ID del usuario propietario es requerido para venues privados');
    }

    const venue = this.venueRepository.create({
      ...createVenueDto,
      ownerUserId,
      createdByAdmin: false,
      status: BaseStatus.ACTIVE,
    });

    return await this.venueRepository.save(venue);
  }

  /**
   * @description Busca un venue por su ID
   * @param { string } id - ID del venue
   * @returns { Promise<Venue> } Venue encontrado con sus canchas
   */
  async findById(id: string): Promise<Venue> {
    const venue = await this.venueRepository.findOne({
      where: { id },
      relations: ['courts', 'images'],
    });

    if (!venue) {
      throw new NotFoundException(`Venue con ID ${id} no encontrado`);
    }

    return venue;
  }

  /**
   * @description Busca venues cercanos a una ubicación con filtros opcionales
   * @param { FindNearbyVenuesDto } filters - Filtros de búsqueda (lat, lng, radio, tipo, estado)
   * @returns { Promise<Array<Venue & { distance: number }>> } Lista de venues con distancia en km
   */
  async findNearby(filters: FindNearbyVenuesDto): Promise<Array<Venue & { distance: number }>> {
    const { lat, lng, radiusKm = 10, type, status } = filters;

    // Construir query base
    const queryBuilder = this.venueRepository
      .createQueryBuilder('venue')
      .leftJoinAndSelect('venue.courts', 'courts')
      .leftJoinAndSelect('venue.images', 'images')
      .addOrderBy('images.display_order', 'ASC');

    // Aplicar filtros opcionales
    if (type) {
      queryBuilder.andWhere('venue.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('venue.status = :status', { status });
    } else {
      // Por defecto, solo mostrar venues activos
      queryBuilder.andWhere('venue.status = :status', { status: BaseStatus.ACTIVE });
    }

    // Obtener todos los venues que cumplen los filtros
    const venues = await queryBuilder.getMany();

    // Calcular distancia para cada venue y filtrar por radio
    const venuesWithDistance = venues
      .map((venue) => {
        const distance = this.calculateDistance(lat, lng, venue.lat, venue.lng);
        return {
          ...venue,
          distance: parseFloat(distance.toFixed(2)),
        };
      })
      .filter((venue) => venue.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return venuesWithDistance;
  }

  /**
   * @description Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
   * @param { number } lat1 - Latitud del punto 1
   * @param { number } lng1 - Longitud del punto 1
   * @param { number } lat2 - Latitud del punto 2
   * @param { number } lng2 - Longitud del punto 2
   * @returns { number } Distancia en kilómetros
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLng = this.degreesToRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
        Math.cos(this.degreesToRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * @description Convierte grados a radianes
   * @param { number } degrees - Ángulo en grados
   * @returns { number } Ángulo en radianes
   */
  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
