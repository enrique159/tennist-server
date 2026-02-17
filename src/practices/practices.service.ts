import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Venue } from '@/venues/venue.entity';
import { BaseStatus } from '@/shared/domain/status';
import { ClassSession } from '@/classes/entities/class-session.entity';
import {
  AttendanceStatus,
  ClassSessionAttendance,
} from '@/classes/entities/class-session-attendance.entity';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { FindPracticesDto } from './dto/find-practices.dto';
import {
  PlayerPractice,
  PracticeSourceType,
} from './entities/player-practice.entity';

@Injectable()
export class PracticesService {
  constructor(
    @InjectRepository(PlayerPractice)
    private readonly practicesRepository: Repository<PlayerPractice>,
    @InjectRepository(Venue)
    private readonly venuesRepository: Repository<Venue>,
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    @InjectRepository(ClassSessionAttendance)
    private readonly classSessionAttendanceRepository: Repository<ClassSessionAttendance>,
  ) {}

  /**
   * @description Registra una práctica para el jugador autenticado
   * @param { CreatePracticeDto } dto - Datos de la práctica
   * @param { any } currentUser - Usuario autenticado
   * @returns { Promise<PlayerPractice> } Práctica registrada
   */
  async createPractice(
    dto: CreatePracticeDto,
    currentUser: any,
  ): Promise<PlayerPractice> {
    const sourceType = dto.sourceType ?? PracticeSourceType.MANUAL;

    this.validateDateRange(dto.practiceDate, dto.practiceDate);
    await this.validateVenueIfNeeded(dto.venueId);
    const classReference = await this.validateClassPracticeData(dto, sourceType, currentUser.id);

    const practice = this.practicesRepository.create({
      userId: currentUser.id,
      practiceDate: dto.practiceDate,
      durationMinutes: dto.durationMinutes,
      playedFriendlyMatch: dto.playedFriendlyMatch ?? false,
      practicedServes: dto.practicedServes ?? false,
      venueId: dto.venueId ?? null,
      sourceType,
      classId: classReference.classId ?? dto.classId ?? null,
      classSessionId: classReference.classSessionId ?? dto.classSessionId ?? null,
      className: classReference.className ?? dto.className ?? null,
      notes: dto.notes ?? null,
    });

    const savedPractice = await this.practicesRepository.save(practice);
    return this.practicesRepository.findOne({
      where: { id: savedPractice.id },
      relations: ['venue'],
    });
  }

  /**
   * @description Lista prácticas del jugador autenticado filtradas por fecha y tipo
   * @param { string } userId - ID del jugador
   * @param { FindPracticesDto } filters - Filtros opcionales
   * @returns { Promise<PlayerPractice[]> } Lista de prácticas
   */
  async getMyPractices(
    userId: string,
    filters: FindPracticesDto,
  ): Promise<PlayerPractice[]> {
    this.validateDateRange(filters.fromDate, filters.toDate);

    return this.buildFilteredPracticeQuery(userId, filters)
      .leftJoinAndSelect('practice.venue', 'venue')
      .orderBy('practice.practiceDate', 'DESC')
      .addOrderBy('practice.createdAt', 'DESC')
      .getMany();
  }

  /**
   * @description Obtiene estadísticas de progreso de prácticas del jugador autenticado
   * @param { string } userId - ID del jugador
   * @param { FindPracticesDto } filters - Filtros opcionales
   * @returns { Promise<object> } Resumen estadístico de prácticas
   */
  async getMyPracticeStats(userId: string, filters: FindPracticesDto) {
    this.validateDateRange(filters.fromDate, filters.toDate);

    const practices = await this.buildFilteredPracticeQuery(userId, filters).getMany();

    const totalPractices = practices.length;
    const totalDurationMinutes = practices.reduce(
      (acc, practice) => acc + practice.durationMinutes,
      0,
    );
    const friendlyMatchPractices = practices.filter(
      (practice) => practice.playedFriendlyMatch,
    ).length;
    const servePractices = practices.filter(
      (practice) => practice.practicedServes,
    ).length;
    const manualPractices = practices.filter(
      (practice) => practice.sourceType === PracticeSourceType.MANUAL,
    ).length;
    const classPractices = practices.filter(
      (practice) => practice.sourceType === PracticeSourceType.CLASS,
    ).length;
    const uniqueVenueCount = new Set(
      practices
        .filter((practice) => !!practice.venueId)
        .map((practice) => practice.venueId),
    ).size;
    const uniquePracticeDays = new Set(
      practices.map((practice) => practice.practiceDate),
    ).size;

    const averageDurationMinutes =
      totalPractices > 0 ? Math.round(totalDurationMinutes / totalPractices) : 0;

    const streaks = this.calculateStreaks(
      Array.from(new Set(practices.map((practice) => practice.practiceDate))),
    );

    const dateRangeDays =
      filters.fromDate && filters.toDate
        ? this.countDaysBetween(filters.fromDate, filters.toDate)
        : null;

    const consistencyPercentage =
      dateRangeDays && dateRangeDays > 0
        ? Number(((uniquePracticeDays / dateRangeDays) * 100).toFixed(2))
        : null;

    return {
      totalPractices,
      totalDurationMinutes,
      averageDurationMinutes,
      friendlyMatchPractices,
      servePractices,
      manualPractices,
      classPractices,
      uniqueVenueCount,
      uniquePracticeDays,
      currentStreakDays: streaks.current,
      longestStreakDays: streaks.longest,
      consistencyPercentage,
      filtersApplied: {
        fromDate: filters.fromDate ?? null,
        toDate: filters.toDate ?? null,
        sourceType: filters.sourceType ?? null,
      },
    };
  }

  private buildFilteredPracticeQuery(
    userId: string,
    filters: FindPracticesDto,
  ): SelectQueryBuilder<PlayerPractice> {
    const query = this.practicesRepository
      .createQueryBuilder('practice')
      .where('practice.user_id = :userId', { userId });

    if (filters.fromDate) {
      query.andWhere('practice.practice_date >= :fromDate', {
        fromDate: filters.fromDate,
      });
    }

    if (filters.toDate) {
      query.andWhere('practice.practice_date <= :toDate', {
        toDate: filters.toDate,
      });
    }

    if (filters.sourceType) {
      query.andWhere('practice.source_type = :sourceType', {
        sourceType: filters.sourceType,
      });
    }

    return query;
  }

  private async validateVenueIfNeeded(venueId?: string): Promise<void> {
    if (!venueId) {
      return;
    }

    const venue = await this.venuesRepository.findOne({
      where: { id: venueId },
    });

    if (!venue) {
      throw new NotFoundException(`Venue con ID ${venueId} no encontrado`);
    }

    if (venue.status !== BaseStatus.ACTIVE) {
      throw new BadRequestException('No se puede registrar práctica en un venue inactivo');
    }
  }

  private async validateClassPracticeData(
    dto: CreatePracticeDto,
    sourceType: PracticeSourceType,
    userId: string,
  ): Promise<{
    classId?: string;
    classSessionId?: string;
    className?: string;
  }> {
    if (sourceType !== PracticeSourceType.CLASS) {
      return {};
    }

    if (!dto.classAttended) {
      throw new BadRequestException(
        'Solo puedes registrar práctica de clase cuando existe asistencia',
      );
    }

    if (!dto.classSessionId) {
      throw new BadRequestException(
        'Para prácticas de clase debes enviar classSessionId',
      );
    }

    const session = await this.classSessionRepository.findOne({
      where: { id: dto.classSessionId },
      relations: ['course'],
    });

    if (!session) {
      throw new NotFoundException(
        `Clase con ID ${dto.classSessionId} no encontrada`,
      );
    }

    const attendance = await this.classSessionAttendanceRepository.findOne({
      where: {
        sessionId: session.id,
        userId,
      },
    });

    if (!attendance || attendance.status !== AttendanceStatus.PRESENT) {
      throw new BadRequestException(
        'Solo puedes registrar como práctica las clases donde asististe',
      );
    }

    return {
      classId: session.courseId,
      classSessionId: session.id,
      className: session.course?.title ?? dto.className,
    };
  }

  private validateDateRange(fromDate?: string, toDate?: string): void {
    if (!fromDate || !toDate) {
      return;
    }

    if (fromDate > toDate) {
      throw new BadRequestException('fromDate no puede ser mayor que toDate');
    }
  }

  private calculateStreaks(dateStrings: string[]): {
    current: number;
    longest: number;
  } {
    if (!dateStrings.length) {
      return { current: 0, longest: 0 };
    }

    const sortedAsc = [...dateStrings].sort((a, b) => a.localeCompare(b));
    let longest = 1;
    let running = 1;

    for (let i = 1; i < sortedAsc.length; i += 1) {
      const diff = this.daysDifference(sortedAsc[i - 1], sortedAsc[i]);
      if (diff === 1) {
        running += 1;
      } else {
        running = 1;
      }
      if (running > longest) {
        longest = running;
      }
    }

    const sortedDesc = [...sortedAsc].reverse();
    const today = this.formatDate(new Date());
    const yesterday = this.formatDate(this.shiftDate(new Date(), -1));
    const latest = sortedDesc[0];

    if (latest !== today && latest !== yesterday) {
      return { current: 0, longest };
    }

    let current = 1;
    for (let i = 1; i < sortedDesc.length; i += 1) {
      const diff = this.daysDifference(sortedDesc[i], sortedDesc[i - 1]);
      if (diff === 1) {
        current += 1;
      } else {
        break;
      }
    }

    return { current, longest };
  }

  private countDaysBetween(fromDate: string, toDate: string): number {
    return this.daysDifference(fromDate, toDate) + 1;
  }

  private daysDifference(fromDate: string, toDate: string): number {
    const from = new Date(`${fromDate}T00:00:00.000Z`);
    const to = new Date(`${toDate}T00:00:00.000Z`);
    const diffMs = to.getTime() - from.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  private shiftDate(date: Date, days: number): Date {
    const shifted = new Date(date);
    shifted.setUTCDate(shifted.getUTCDate() + days);
    return shifted;
  }

  private formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
