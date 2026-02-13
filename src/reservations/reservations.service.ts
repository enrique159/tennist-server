import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourtReservation, ReservationStatus, ReservationSourceType } from './entities/court-reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Court } from '@/courts/entities/court.entity';
import { CourtAvailabilityService } from '@/courts/services/court-availability.service';
import { CourtPricingService } from '@/courts/services/court-pricing.service';
import { Role } from '@/users/domain/user';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(CourtReservation)
    private reservationRepository: Repository<CourtReservation>,
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    private readonly availabilityService: CourtAvailabilityService,
    private readonly pricingService: CourtPricingService,
  ) {}

  /**
   * @description Crea una nueva reserva para una cancha
   * @param { string } courtId - ID de la cancha
   * @param { CreateReservationDto } dto - Datos de la reserva
   * @param { any } currentUser - Usuario que crea la reserva
   * @returns { Promise<CourtReservation> } Reserva creada con status CONFIRMED
   */
  async createReservation(
    courtId: string,
    dto: CreateReservationDto,
    currentUser: any,
  ): Promise<CourtReservation> {
    // 1. Cargar cancha y validar que exista y esté activa
    const court = await this.courtRepository.findOne({
      where: { id: courtId },
      relations: ['venue'],
    });

    if (!court) {
      throw new NotFoundException(`Cancha con ID ${courtId} no encontrada`);
    }

    if (!court.isActive) {
      throw new BadRequestException('La cancha no está activa');
    }

    // 2. Validar rango horario
    const startMinutes = this.timeToMinutes(dto.startTime);
    const endMinutes = this.timeToMinutes(dto.endTime);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
    }

    const durationMinutes = endMinutes - startMinutes;

    // 3. Validar disponibilidad real (horario base + excepciones)
    const availableSlots = await this.availabilityService.getAvailableSlots(courtId, dto.date);

    const isWithinAvailability = availableSlots.some(
      (slot) =>
        this.timeToMinutes(slot.startTime) <= startMinutes &&
        this.timeToMinutes(slot.endTime) >= endMinutes,
    );

    if (!isWithinAvailability) {
      throw new BadRequestException(
        'El horario solicitado no está dentro de la disponibilidad de la cancha',
      );
    }

    // 4. Verificar que no haya reservas confirmadas que se solapen
    const overlapping = await this.reservationRepository
      .createQueryBuilder('reservation')
      .where('reservation.court_id = :courtId', { courtId })
      .andWhere('reservation.date = :date', { date: dto.date })
      .andWhere('reservation.status = :status', { status: ReservationStatus.CONFIRMED })
      .andWhere('reservation.start_time < :endTime', { endTime: dto.endTime })
      .andWhere('reservation.end_time > :startTime', { startTime: dto.startTime })
      .getOne();

    if (overlapping) {
      throw new BadRequestException(
        'Ya existe una reserva confirmada que se solapa con el horario solicitado',
      );
    }

    // 5. Calcular precio usando CourtPricingService
    const priceCalculation = await this.pricingService.calculatePrice(
      courtId,
      durationMinutes,
      dto.playersCount,
    );

    // 6. Crear reserva CONFIRMED con sourceType USER
    const reservation = this.reservationRepository.create({
      courtId,
      userId: currentUser.id,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      playersCount: dto.playersCount,
      totalPrice: priceCalculation.totalPriceCents,
      status: ReservationStatus.CONFIRMED,
      sourceType: ReservationSourceType.USER,
      sourceId: null,
    });

    const saved = await this.reservationRepository.save(reservation);

    // 7. Retornar reserva con relaciones
    return await this.reservationRepository.findOne({
      where: { id: saved.id },
      relations: ['court', 'user'],
    });
  }

  /**
   * @description Crea una reserva de sistema (para clases, torneos o mantenimiento)
   * @param { object } params - Parámetros de la reserva de sistema
   * @param { string } params.courtId - ID de la cancha
   * @param { string } params.userId - ID del usuario que genera la reserva
   * @param { string } params.date - Fecha en formato YYYY-MM-DD
   * @param { string } params.startTime - Hora de inicio en formato HH:MM
   * @param { string } params.endTime - Hora de fin en formato HH:MM
   * @param { number } params.playersCount - Cantidad de jugadores
   * @param { ReservationSourceType } params.sourceType - Tipo de origen de la reserva
   * @param { number | null } params.sourceId - ID del origen (classSessionId, tournamentId, etc.)
   * @returns { Promise<CourtReservation> } Reserva creada con status CONFIRMED
   */
  async createSystemReservation(params: {
    courtId: string;
    userId: string;
    date: string;
    startTime: string;
    endTime: string;
    playersCount: number;
    sourceType: ReservationSourceType;
    sourceId?: number | null;
  }): Promise<CourtReservation> {
    const { courtId, userId, date, startTime, endTime, playersCount, sourceType, sourceId } = params;

    // 1. Cargar cancha y validar que exista y esté activa
    const court = await this.courtRepository.findOne({
      where: { id: courtId },
      relations: ['venue'],
    });

    if (!court) {
      throw new NotFoundException(`Cancha con ID ${courtId} no encontrada`);
    }

    if (!court.isActive) {
      throw new BadRequestException('La cancha no está activa');
    }

    // 2. Validar rango horario
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
    }

    const durationMinutes = endMinutes - startMinutes;

    // 3. Validar disponibilidad real
    const availableSlots = await this.availabilityService.getAvailableSlots(courtId, date);

    const isWithinAvailability = availableSlots.some(
      (slot) =>
        this.timeToMinutes(slot.startTime) <= startMinutes &&
        this.timeToMinutes(slot.endTime) >= endMinutes,
    );

    if (!isWithinAvailability) {
      throw new BadRequestException(
        'El horario solicitado no está dentro de la disponibilidad de la cancha',
      );
    }

    // 4. Verificar solapamiento
    const overlapping = await this.reservationRepository
      .createQueryBuilder('reservation')
      .where('reservation.court_id = :courtId', { courtId })
      .andWhere('reservation.date = :date', { date })
      .andWhere('reservation.status = :status', { status: ReservationStatus.CONFIRMED })
      .andWhere('reservation.start_time < :endTime', { endTime })
      .andWhere('reservation.end_time > :startTime', { startTime })
      .getOne();

    if (overlapping) {
      throw new BadRequestException(
        'Ya existe una reserva confirmada que se solapa con el horario solicitado',
      );
    }

    // 5. Calcular precio si aplica (MAINTENANCE no requiere precio)
    let totalPrice = 0;
    if (sourceType !== ReservationSourceType.MAINTENANCE) {
      const priceCalculation = await this.pricingService.calculatePrice(
        courtId,
        durationMinutes,
        playersCount,
      );
      totalPrice = priceCalculation.totalPriceCents;
    }

    // 6. Crear reserva CONFIRMED
    const reservation = this.reservationRepository.create({
      courtId,
      userId,
      date,
      startTime,
      endTime,
      playersCount,
      totalPrice,
      status: ReservationStatus.CONFIRMED,
      sourceType,
      sourceId: sourceId ?? null,
    });

    const saved = await this.reservationRepository.save(reservation);

    return await this.reservationRepository.findOne({
      where: { id: saved.id },
      relations: ['court', 'user'],
    });
  }

  /**
   * @description Obtiene todas las reservas de un usuario
   * @param { string } userId - ID del usuario
   * @returns { Promise<CourtReservation[]> } Lista de reservas del usuario ordenadas por fecha
   */
  async getUserReservations(userId: string): Promise<CourtReservation[]> {
    return await this.reservationRepository.find({
      where: { userId },
      relations: ['court', 'court.venue'],
      order: { date: 'DESC', startTime: 'DESC' },
    });
  }

  /**
   * @description Cancela una reserva existente validando permisos según el tipo de origen
   * @param { string } reservationId - ID de la reserva
   * @param { any } currentUser - Usuario que solicita la cancelación
   * @returns { Promise<CourtReservation> } Reserva cancelada
   */
  async cancelReservation(
    reservationId: string,
    currentUser: any,
  ): Promise<CourtReservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['court', 'court.venue'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reserva con ID ${reservationId} no encontrada`);
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('La reserva ya está cancelada');
    }

    // Validar permisos según sourceType
    this.validateCancellationPermissions(reservation, currentUser);

    reservation.status = ReservationStatus.CANCELLED;
    return await this.reservationRepository.save(reservation);
  }

  /**
   * @description Cancela una reserva de sistema (para uso interno de módulos Class/Tournament)
   * @param { string } reservationId - ID de la reserva
   * @param { ReservationSourceType } expectedSourceType - Tipo de origen esperado
   * @returns { Promise<CourtReservation> } Reserva cancelada
   */
  async cancelSystemReservation(
    reservationId: string,
    expectedSourceType: ReservationSourceType,
  ): Promise<CourtReservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException(`Reserva con ID ${reservationId} no encontrada`);
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('La reserva ya está cancelada');
    }

    if (reservation.sourceType !== expectedSourceType) {
      throw new ForbiddenException(
        `Esta reserva no es de tipo ${expectedSourceType} y no puede ser cancelada por este módulo`,
      );
    }

    reservation.status = ReservationStatus.CANCELLED;
    return await this.reservationRepository.save(reservation);
  }

  /**
   * @description Valida los permisos de cancelación según el tipo de origen de la reserva
   * @param { CourtReservation } reservation - Reserva a validar
   * @param { any } currentUser - Usuario que solicita la cancelación
   * @returns { void }
   */
  private validateCancellationPermissions(
    reservation: CourtReservation,
    currentUser: any,
  ): void {
    const isAdmin = currentUser.role === Role.ADMIN;
    const isVenueOwner = reservation.court.venue.ownerUserId === currentUser.id;

    switch (reservation.sourceType) {
      case ReservationSourceType.USER: {
        const isOwner = reservation.userId === currentUser.id;
        if (!isOwner && !isAdmin && !isVenueOwner) {
          throw new ForbiddenException('No tienes permiso para cancelar esta reserva');
        }
        break;
      }

      case ReservationSourceType.CLASS:
        throw new ForbiddenException(
          'Las reservas de clases solo pueden ser canceladas por el módulo de clases',
        );

      case ReservationSourceType.TOURNAMENT:
        throw new ForbiddenException(
          'Las reservas de torneos solo pueden ser canceladas por el módulo de torneos',
        );

      case ReservationSourceType.MAINTENANCE: {
        if (!isAdmin && !isVenueOwner) {
          throw new ForbiddenException(
            'Solo un ADMIN o el propietario del venue pueden cancelar reservas de mantenimiento',
          );
        }
        break;
      }

      default:
        throw new ForbiddenException('Tipo de reserva no reconocido');
    }
  }

  /**
   * @description Obtiene las reservas confirmadas de una cancha en una fecha específica
   * @param { string } courtId - ID de la cancha
   * @param { string } date - Fecha en formato YYYY-MM-DD
   * @returns { Promise<CourtReservation[]> } Lista de reservas confirmadas
   */
  async getConfirmedReservationsByCourtAndDate(
    courtId: string,
    date: string,
  ): Promise<CourtReservation[]> {
    return await this.reservationRepository.find({
      where: {
        courtId,
        date,
        status: ReservationStatus.CONFIRMED,
      },
      order: { startTime: 'ASC' },
    });
  }

  /**
   * @description Convierte una hora en formato HH:MM a minutos desde medianoche
   * @param { string } time - Hora en formato HH:MM
   * @returns { number } Minutos totales desde medianoche
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
