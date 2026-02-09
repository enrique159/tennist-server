import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue, VenueType } from './venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
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
      relations: ['courts'],
    });

    if (!venue) {
      throw new NotFoundException(`Venue con ID ${id} no encontrado`);
    }

    return venue;
  }
}
