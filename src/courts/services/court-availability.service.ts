import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Court } from '../entities/court.entity';
import { CourtSchedule } from '../entities/court-schedule.entity';
import { CourtAvailability, AvailabilityType } from '../entities/court-availability.entity';
import { Venue } from '@/venues/venue.entity';
import { CreateCourtAvailabilityDto } from '../dto/create-court-availability.dto';
import { Role } from '@/users/domain/user';

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

@Injectable()
export class CourtAvailabilityService {
  constructor(
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(CourtSchedule)
    private scheduleRepository: Repository<CourtSchedule>,
    @InjectRepository(CourtAvailability)
    private availabilityRepository: Repository<CourtAvailability>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  /**
   * @description Obtiene los slots de tiempo disponibles para una cancha en una fecha específica
   * @param { string } courtId - ID de la cancha
   * @param { string } date - Fecha en formato YYYY-MM-DD
   * @returns { Promise<TimeSlot[]> } Lista de slots de tiempo disponibles
   */
  async getAvailableSlots(courtId: string, date: string): Promise<TimeSlot[]> {
    const court = await this.courtRepository.findOne({ where: { id: courtId } });

    if (!court) {
      throw new NotFoundException(`Cancha con ID ${courtId} no encontrada`);
    }

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    const schedule = await this.scheduleRepository.findOne({
      where: { courtId, dayOfWeek },
    });

    if (!schedule) {
      return [];
    }

    let availableSlots: TimeSlot[] = [
      {
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      },
    ];

    const overrides = await this.availabilityRepository.find({
      where: { courtId, date },
    });

    for (const override of overrides) {
      if (override.type === AvailabilityType.BLOCKED) {
        availableSlots = this.removeTimeSlot(
          availableSlots,
          override.startTime,
          override.endTime,
        );
      } else if (override.type === AvailabilityType.AVAILABLE) {
        availableSlots = this.addTimeSlot(
          availableSlots,
          override.startTime,
          override.endTime,
        );
      }
    }

    return availableSlots;
  }

  /**
   * @description Elimina un bloque de tiempo de los slots disponibles
   * @param { TimeSlot[] } slots - Lista de slots disponibles
   * @param { string } blockStart - Hora de inicio del bloqueo
   * @param { string } blockEnd - Hora de fin del bloqueo
   * @returns { TimeSlot[] } Lista de slots actualizada sin el bloque
   */
  private removeTimeSlot(slots: TimeSlot[], blockStart: string, blockEnd: string): TimeSlot[] {
    const result: TimeSlot[] = [];

    for (const slot of slots) {
      if (this.timeToMinutes(slot.endTime) <= this.timeToMinutes(blockStart) ||
          this.timeToMinutes(slot.startTime) >= this.timeToMinutes(blockEnd)) {
        result.push(slot);
      } else {
        if (this.timeToMinutes(slot.startTime) < this.timeToMinutes(blockStart)) {
          result.push({
            startTime: slot.startTime,
            endTime: blockStart,
          });
        }

        if (this.timeToMinutes(slot.endTime) > this.timeToMinutes(blockEnd)) {
          result.push({
            startTime: blockEnd,
            endTime: slot.endTime,
          });
        }
      }
    }

    return result;
  }

  /**
   * @description Agrega un nuevo slot de tiempo y fusiona slots contiguos
   * @param { TimeSlot[] } slots - Lista de slots existentes
   * @param { string } newStart - Hora de inicio del nuevo slot
   * @param { string } newEnd - Hora de fin del nuevo slot
   * @returns { TimeSlot[] } Lista de slots actualizada y fusionada
   */
  private addTimeSlot(slots: TimeSlot[], newStart: string, newEnd: string): TimeSlot[] {
    const newSlot: TimeSlot = { startTime: newStart, endTime: newEnd };
    const allSlots = [...slots, newSlot];

    allSlots.sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));

    const merged: TimeSlot[] = [];
    let current = allSlots[0];

    for (let i = 1; i < allSlots.length; i++) {
      const next = allSlots[i];

      if (this.timeToMinutes(current.endTime) >= this.timeToMinutes(next.startTime)) {
        current = {
          startTime: current.startTime,
          endTime: this.timeToMinutes(current.endTime) > this.timeToMinutes(next.endTime)
            ? current.endTime
            : next.endTime,
        };
      } else {
        merged.push(current);
        current = next;
      }
    }

    merged.push(current);
    return merged;
  }

  /**
   * @description Convierte una hora en formato HH:MM a minutos
   * @param { string } time - Hora en formato HH:MM
   * @returns { number } Minutos totales desde medianoche
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * @description Crea una excepción de disponibilidad (bloqueo o disponibilidad especial)
   * @param { string } courtId - ID de la cancha
   * @param { CreateCourtAvailabilityDto } createAvailabilityDto - Datos de la excepción
   * @param { any } currentUser - Usuario actual que realiza la acción
   * @returns { Promise<CourtAvailability> } Excepción creada
   */
  async createException(
    courtId: string,
    createAvailabilityDto: CreateCourtAvailabilityDto,
    currentUser: any,
  ): Promise<CourtAvailability> {
    const court = await this.courtRepository.findOne({
      where: { id: courtId },
      relations: ['venue'],
    });

    if (!court) {
      throw new NotFoundException(`Cancha con ID ${courtId} no encontrada`);
    }

    const venue = await this.venueRepository.findOne({
      where: { id: court.venueId },
    });

    if (currentUser.role !== Role.ADMIN && venue.ownerUserId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para gestionar la disponibilidad de esta cancha');
    }

    this.validateTimeRange(createAvailabilityDto.startTime, createAvailabilityDto.endTime);

    const availability = this.availabilityRepository.create({
      ...createAvailabilityDto,
      courtId,
    });

    return await this.availabilityRepository.save(availability);
  }

  /**
   * @description Obtiene todas las excepciones de disponibilidad de una cancha
   * @param { string } courtId - ID de la cancha
   * @returns { Promise<CourtAvailability[]> } Lista de excepciones
   */
  async findExceptionsByCourtId(courtId: string): Promise<CourtAvailability[]> {
    const court = await this.courtRepository.findOne({ where: { id: courtId } });

    if (!court) {
      throw new NotFoundException(`Cancha con ID ${courtId} no encontrada`);
    }

    return await this.availabilityRepository.find({
      where: { courtId },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  /**
   * @description Elimina una excepción de disponibilidad
   * @param { string } availabilityId - ID de la excepción
   * @param { any } currentUser - Usuario actual que realiza la acción
   * @returns { Promise<void> }
   */
  async deleteException(availabilityId: string, currentUser: any): Promise<void> {
    const availability = await this.availabilityRepository.findOne({
      where: { id: availabilityId },
      relations: ['court', 'court.venue'],
    });

    if (!availability) {
      throw new NotFoundException(`Excepción de disponibilidad con ID ${availabilityId} no encontrada`);
    }

    const venue = availability.court.venue;

    if (currentUser.role !== Role.ADMIN && venue.ownerUserId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para eliminar esta excepción');
    }

    await this.availabilityRepository.remove(availability);
  }

  /**
   * @description Valida que el rango de tiempo sea correcto
   * @param { string } startTime - Hora de inicio
   * @param { string } endTime - Hora de fin
   * @returns { void }
   */
  private validateTimeRange(startTime: string, endTime: string): void {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start >= end) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
    }
  }
}
