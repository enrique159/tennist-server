import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourtSchedule } from '../entities/court-schedule.entity';
import { Court } from '../entities/court.entity';
import { Venue } from '@/venues/venue.entity';
import { CreateCourtScheduleDto } from '../dto/create-court-schedule.dto';
import { UpdateCourtScheduleDto } from '../dto/update-court-schedule.dto';
import { Role } from '@/users/domain/user';

@Injectable()
export class CourtScheduleService {
  constructor(
    @InjectRepository(CourtSchedule)
    private scheduleRepository: Repository<CourtSchedule>,
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  /**
   * @description Crea un horario semanal para una cancha
   * @param { string } courtId - ID de la cancha
   * @param { CreateCourtScheduleDto } createScheduleDto - Datos del horario
   * @param { any } currentUser - Usuario actual que realiza la acción
   * @returns { Promise<CourtSchedule> } Horario creado
   */
  async create(
    courtId: string,
    createScheduleDto: CreateCourtScheduleDto,
    currentUser: any,
  ): Promise<CourtSchedule> {
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
      throw new ForbiddenException('No tienes permiso para gestionar horarios de esta cancha');
    }

    this.validateTimeRange(createScheduleDto.startTime, createScheduleDto.endTime);

    const existingSchedule = await this.scheduleRepository.findOne({
      where: {
        courtId,
        dayOfWeek: createScheduleDto.dayOfWeek,
      },
    });

    if (existingSchedule) {
      throw new BadRequestException(
        `Ya existe un horario para esta cancha en el día ${createScheduleDto.dayOfWeek}`,
      );
    }

    const schedule = this.scheduleRepository.create({
      ...createScheduleDto,
      courtId,
    });

    return await this.scheduleRepository.save(schedule);
  }

  /**
   * @description Obtiene todos los horarios de una cancha
   * @param { string } courtId - ID de la cancha
   * @returns { Promise<CourtSchedule[]> } Lista de horarios
   */
  async findByCourtId(courtId: string): Promise<CourtSchedule[]> {
    const court = await this.courtRepository.findOne({ where: { id: courtId } });

    if (!court) {
      throw new NotFoundException(`Cancha con ID ${courtId} no encontrada`);
    }

    return await this.scheduleRepository.find({
      where: { courtId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  /**
   * @description Actualiza un horario existente
   * @param { string } scheduleId - ID del horario
   * @param { UpdateCourtScheduleDto } updateScheduleDto - Datos a actualizar
   * @param { any } currentUser - Usuario actual que realiza la acción
   * @returns { Promise<CourtSchedule> } Horario actualizado
   */
  async update(
    scheduleId: string,
    updateScheduleDto: UpdateCourtScheduleDto,
    currentUser: any,
  ): Promise<CourtSchedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['court', 'court.venue'],
    });

    if (!schedule) {
      throw new NotFoundException(`Horario con ID ${scheduleId} no encontrado`);
    }

    const venue = schedule.court.venue;

    if (currentUser.role !== Role.ADMIN && venue.ownerUserId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para modificar este horario');
    }

    if (updateScheduleDto.startTime && updateScheduleDto.endTime) {
      this.validateTimeRange(updateScheduleDto.startTime, updateScheduleDto.endTime);
    }

    Object.assign(schedule, updateScheduleDto);

    return await this.scheduleRepository.save(schedule);
  }

  /**
   * @description Elimina un horario
   * @param { string } scheduleId - ID del horario
   * @param { any } currentUser - Usuario actual que realiza la acción
   * @returns { Promise<void> }
   */
  async delete(scheduleId: string, currentUser: any): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['court', 'court.venue'],
    });

    if (!schedule) {
      throw new NotFoundException(`Horario con ID ${scheduleId} no encontrado`);
    }

    const venue = schedule.court.venue;

    if (currentUser.role !== Role.ADMIN && venue.ownerUserId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para eliminar este horario');
    }

    await this.scheduleRepository.remove(schedule);
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
