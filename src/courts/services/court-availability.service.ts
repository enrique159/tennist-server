import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Court } from '../entities/court.entity';
import { CourtSchedule } from '../entities/court-schedule.entity';
import { CourtAvailability, AvailabilityType } from '../entities/court-availability.entity';

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
}
