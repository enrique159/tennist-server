import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { CourseSchedule } from './entities/course-schedule.entity';
import {
  CourseEnrollment,
  EnrollmentSourceType,
  EnrollmentStatus,
} from './entities/course-enrollment.entity';
import {
  AttendanceStatus,
  ClassSessionAttendance,
} from './entities/class-session-attendance.entity';
import { ClassSession } from './entities/class-session.entity';
import { Venue } from '@/venues/venue.entity';
import { BaseStatus } from '@/shared/domain/status';
import { CreateCourseDto } from './dto/create-course.dto';
import { SearchCoursesDto } from './dto/search-courses.dto';
import { ReviewEnrollmentDto } from './dto/review-enrollment.dto';
import { AddUserToCourseDto } from './dto/add-user-to-course.dto';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { FindCourseEnrollmentsDto } from './dto/find-course-enrollments.dto';
import { Role } from '@/users/domain/user';
import { UpdateCourseStatusDto } from './dto/update-course-status.dto';
import { FindMyClassSessionsDto } from './dto/find-my-class-sessions.dto';
import {
  PlayerPractice,
  PracticeSourceType,
} from '@/practices/entities/player-practice.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseSchedule)
    private readonly courseScheduleRepository: Repository<CourseSchedule>,
    @InjectRepository(CourseEnrollment)
    private readonly enrollmentRepository: Repository<CourseEnrollment>,
    @InjectRepository(ClassSession)
    private readonly sessionRepository: Repository<ClassSession>,
    @InjectRepository(ClassSessionAttendance)
    private readonly attendanceRepository: Repository<ClassSessionAttendance>,
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
    @InjectRepository(PlayerPractice)
    private readonly practicesRepository: Repository<PlayerPractice>,
  ) {}

  /**
   * @description Crea un curso con horarios semanales opcionales
   * @param { CreateCourseDto } dto - Datos del curso
   * @param { any } currentUser - Usuario autenticado
   * @returns { Promise<Course> } Curso creado
   */
  async createCourse(dto: CreateCourseDto, currentUser: any): Promise<Course> {
    this.validateDateRange(dto.startDate, dto.endDate);
    this.validateSchedules(dto.schedules ?? []);
    await this.validateVenueIfNeeded(dto.venueId);

    const course = this.courseRepository.create({
      title: dto.title,
      description: dto.description,
      groupName: dto.groupName,
      difficulty: dto.difficulty,
      maxCapacity: dto.maxCapacity,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: dto.status ?? CourseStatus.DRAFT,
      ownerUserId: currentUser.id,
      venueId: dto.venueId ?? null,
    });

    const savedCourse = await this.courseRepository.save(course);

    if (dto.schedules?.length) {
      const schedules = dto.schedules.map((schedule) =>
        this.courseScheduleRepository.create({
          courseId: savedCourse.id,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        }),
      );
      await this.courseScheduleRepository.save(schedules);
    }

    return this.getCourseById(savedCourse.id);
  }

  /**
   * @description Busca cursos disponibles con filtros y paginación
   * @param { SearchCoursesDto } filters - Filtros de búsqueda
   * @returns { Promise<object> } Respuesta paginada de cursos
   */
  async searchCourses(filters: SearchCoursesDto): Promise<{
    data: Course[];
    meta: {
      totalItems: number;
      page: number;
      limit: number;
      hasMore: boolean;
    };
  }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.schedules', 'schedules')
      .leftJoinAndSelect('course.venue', 'venue');

    if (filters.search) {
      query.andWhere('(course.title LIKE :search OR course.description LIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    if (filters.difficulty) {
      query.andWhere('course.difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    if (filters.status) {
      query.andWhere('course.status = :status', { status: filters.status });
    } else {
      query.andWhere('course.status = :status', { status: CourseStatus.ACTIVE });
    }

    if (filters.ownerUserId) {
      query.andWhere('course.owner_user_id = :ownerUserId', {
        ownerUserId: filters.ownerUserId,
      });
    }

    if (filters.venueId) {
      query.andWhere('course.venue_id = :venueId', { venueId: filters.venueId });
    }

    query.orderBy('course.created_at', 'DESC');

    const totalItems = await query.getCount();
    const data = await query.offset((page - 1) * limit).limit(limit).getMany();

    return {
      data,
      meta: {
        totalItems,
        page,
        limit,
        hasMore: page * limit < totalItems,
      },
    };
  }

  /**
   * @description Solicita inscripción de un jugador a un curso
   * @param { string } courseId - ID del curso
   * @param { any } currentUser - Usuario autenticado
   * @returns { Promise<CourseEnrollment> } Solicitud registrada
   */
  async requestEnrollment(
    courseId: string,
    currentUser: any,
  ): Promise<CourseEnrollment> {
    const course = await this.getCourseById(courseId);

    if (course.ownerUserId === currentUser.id) {
      throw new BadRequestException('No puedes solicitar inscripción a tu propio curso');
    }

    if (course.status !== CourseStatus.ACTIVE) {
      throw new BadRequestException('Solo se puede solicitar inscripción en cursos activos');
    }

    const existing = await this.enrollmentRepository.findOne({
      where: { courseId, userId: currentUser.id },
    });

    if (existing) {
      if (existing.status === EnrollmentStatus.REJECTED) {
        existing.status = EnrollmentStatus.PENDING;
        existing.sourceType = EnrollmentSourceType.USER_REQUEST;
        existing.reviewedAt = null;
        existing.reviewNotes = null;
        existing.reviewedByUserId = null;
        return this.enrollmentRepository.save(existing);
      }
      throw new BadRequestException('Ya existe una solicitud o inscripción para este curso');
    }

    await this.ensureCourseHasCapacity(course.id);

    const enrollment = this.enrollmentRepository.create({
      courseId,
      userId: currentUser.id,
      status: EnrollmentStatus.PENDING,
      sourceType: EnrollmentSourceType.USER_REQUEST,
    });

    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * @description Permite al dueño del curso agregar directamente un jugador
   * @param { string } courseId - ID del curso
   * @param { AddUserToCourseDto } dto - Usuario a agregar
   * @param { any } currentUser - Usuario autenticado
   * @returns { Promise<CourseEnrollment> } Inscripción aprobada
   */
  async addUserToCourse(
    courseId: string,
    dto: AddUserToCourseDto,
    currentUser: any,
  ): Promise<CourseEnrollment> {
    const course = await this.getCourseById(courseId);
    this.ensureCourseOwner(course, currentUser);

    if (dto.userId === course.ownerUserId) {
      throw new BadRequestException('El dueño del curso no puede inscribirse como alumno');
    }

    await this.ensureCourseHasCapacity(course.id);

    const existing = await this.enrollmentRepository.findOne({
      where: { courseId, userId: dto.userId },
    });

    if (existing?.status === EnrollmentStatus.APPROVED) {
      throw new BadRequestException('El usuario ya está inscrito en este curso');
    }

    if (existing) {
      existing.status = EnrollmentStatus.APPROVED;
      existing.sourceType = EnrollmentSourceType.OWNER_ADD;
      existing.reviewedAt = new Date();
      existing.reviewedByUserId = currentUser.id;
      existing.reviewNotes = dto.reviewNotes ?? null;
      return this.enrollmentRepository.save(existing);
    }

    const enrollment = this.enrollmentRepository.create({
      courseId,
      userId: dto.userId,
      status: EnrollmentStatus.APPROVED,
      sourceType: EnrollmentSourceType.OWNER_ADD,
      reviewedAt: new Date(),
      reviewedByUserId: currentUser.id,
      reviewNotes: dto.reviewNotes ?? null,
    });

    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * @description Aprueba o rechaza una solicitud de inscripción
   * @param { string } courseId - ID del curso
   * @param { string } enrollmentId - ID de inscripción
   * @param { ReviewEnrollmentDto } dto - Decisión de revisión
   * @param { any } currentUser - Usuario autenticado
   * @returns { Promise<CourseEnrollment> } Inscripción actualizada
   */
  async reviewEnrollment(
    courseId: string,
    enrollmentId: string,
    dto: ReviewEnrollmentDto,
    currentUser: any,
  ): Promise<CourseEnrollment> {
    const course = await this.getCourseById(courseId);
    this.ensureCourseOwner(course, currentUser);

    if (
      dto.status !== EnrollmentStatus.APPROVED &&
      dto.status !== EnrollmentStatus.REJECTED
    ) {
      throw new BadRequestException('Solo puedes aprobar o rechazar una solicitud');
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, courseId },
    });

    if (!enrollment) {
      throw new NotFoundException(`Inscripción con ID ${enrollmentId} no encontrada`);
    }

    if (enrollment.status === EnrollmentStatus.APPROVED && dto.status === EnrollmentStatus.APPROVED) {
      return enrollment;
    }

    if (dto.status === EnrollmentStatus.APPROVED) {
      await this.ensureCourseHasCapacity(course.id, enrollment.userId);
    }

    enrollment.status = dto.status;
    enrollment.reviewedAt = new Date();
    enrollment.reviewedByUserId = currentUser.id;
    enrollment.reviewNotes = dto.reviewNotes ?? null;

    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * @description Lista inscripciones de un curso para el dueño
   * @param { string } courseId - ID del curso
   * @param { FindCourseEnrollmentsDto } filters - Filtro opcional por estado
   * @param { any } currentUser - Usuario autenticado
   * @returns { Promise<CourseEnrollment[]> } Inscripciones del curso
   */
  async getCourseEnrollments(
    courseId: string,
    filters: FindCourseEnrollmentsDto,
    currentUser: any,
  ): Promise<CourseEnrollment[]> {
    const course = await this.getCourseById(courseId);
    this.ensureCourseOwner(course, currentUser);

    const where: any = { courseId };
    if (filters.status) {
      where.status = filters.status;
    }

    return this.enrollmentRepository.find({
      where,
      relations: ['user'],
      order: {
        status: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  /**
   * @description Actualiza el estado de un curso
   * @param { string } courseId - ID del curso
   * @param { UpdateCourseStatusDto } dto - Estado objetivo
   * @param { any } currentUser - Usuario autenticado
   * @returns { Promise<Course> } Curso actualizado
   */
  async updateCourseStatus(
    courseId: string,
    dto: UpdateCourseStatusDto,
    currentUser: any,
  ): Promise<Course> {
    const course = await this.getCourseById(courseId);
    this.ensureCourseOwner(course, currentUser);

    course.status = dto.status;
    await this.courseRepository.save(course);

    return this.getCourseById(courseId);
  }

  /**
   * @description Lista los cursos aprobados del jugador autenticado
   * @param { string } userId - ID del jugador
   * @returns { Promise<object[]> } Cursos del jugador con metadata de inscripción
   */
  async getMyCourses(userId: string): Promise<
    Array<
      Course & {
        enrollment: {
          id: string;
          status: EnrollmentStatus;
          sourceType: EnrollmentSourceType;
          approvedAt: Date;
        };
      }
    >
  > {
    const enrollments = await this.enrollmentRepository.find({
      where: {
        userId,
        status: EnrollmentStatus.APPROVED,
      },
      relations: ['course', 'course.schedules', 'course.venue'],
      order: {
        updatedAt: 'DESC',
      },
    });

    return enrollments.map((enrollment) => ({
      ...enrollment.course,
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        sourceType: enrollment.sourceType,
        approvedAt: enrollment.reviewedAt,
      },
    }));
  }

  /**
   * @description Lista clases del jugador autenticado con estado de asistencia
   * @param { string } userId - ID del jugador
   * @param { FindMyClassSessionsDto } filters - Filtros opcionales
   * @returns { Promise<ClassSessionAttendance[]> } Asistencia del jugador por clase
   */
  async getMyClassSessions(
    userId: string,
    filters: FindMyClassSessionsDto,
  ): Promise<ClassSessionAttendance[]> {
    this.validateDateRange(filters.fromDate, filters.toDate);

    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .innerJoinAndSelect('attendance.session', 'session')
      .innerJoinAndSelect('session.course', 'course')
      .leftJoinAndSelect('course.venue', 'venue')
      .innerJoin(
        CourseEnrollment,
        'enrollment',
        'enrollment.course_id = course.id AND enrollment.user_id = :userId AND enrollment.status = :approvedStatus',
        {
          userId,
          approvedStatus: EnrollmentStatus.APPROVED,
        },
      )
      .where('attendance.user_id = :userId', { userId });

    if (filters.fromDate) {
      query.andWhere('session.date >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters.toDate) {
      query.andWhere('session.date <= :toDate', { toDate: filters.toDate });
    }

    if (filters.courseId) {
      query.andWhere('session.course_id = :courseId', { courseId: filters.courseId });
    }

    if (filters.attendanceStatus) {
      query.andWhere('attendance.status = :attendanceStatus', {
        attendanceStatus: filters.attendanceStatus,
      });
    }

    query.orderBy('session.date', 'DESC').addOrderBy('session.start_time', 'DESC');

    return query.getMany();
  }

  /**
   * @description Registra una clase dictada para un curso activo ya iniciado
   * @param { string } courseId - ID del curso
   * @param { CreateClassSessionDto } dto - Datos de la clase
   * @param { any } currentUser - Usuario autenticado
   * @returns { Promise<ClassSession> } Clase registrada con asistencia
   */
  async createClassSession(
    courseId: string,
    dto: CreateClassSessionDto,
    currentUser: any,
  ): Promise<ClassSession> {
    const course = await this.getCourseById(courseId);
    this.ensureCourseOwner(course, currentUser);
    this.ensureCourseHasStarted(course);
    this.validateTimeRange(dto.startTime, dto.endTime);

    const attendanceUsers = dto.attendance?.map((item) => item.userId) ?? [];

    if (attendanceUsers.length) {
      const uniqueUsers = new Set(attendanceUsers);
      if (uniqueUsers.size !== attendanceUsers.length) {
        throw new BadRequestException('La lista de asistencia contiene usuarios duplicados');
      }

      const approvedCount = await this.enrollmentRepository.count({
        where: {
          courseId,
          status: EnrollmentStatus.APPROVED,
        },
      });

      if (approvedCount === 0) {
        throw new BadRequestException('No hay alumnos inscritos aprobados en el curso');
      }

      const approvedEnrollments = await this.enrollmentRepository.find({
        where: {
          courseId,
          status: EnrollmentStatus.APPROVED,
        },
      });

      const approvedUserIds = new Set(approvedEnrollments.map((item) => item.userId));

      for (const userId of attendanceUsers) {
        if (!approvedUserIds.has(userId)) {
          throw new BadRequestException(
            `El usuario ${userId} no está inscrito y aprobado en el curso`,
          );
        }
      }
    }

    const session = this.sessionRepository.create({
      courseId,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      generalNotes: dto.generalNotes ?? null,
    });

    const savedSession = await this.sessionRepository.save(session);

    let savedAttendanceRows: ClassSessionAttendance[] = [];

    if (dto.attendance?.length) {
      const rows = dto.attendance.map((item) =>
        this.attendanceRepository.create({
          sessionId: savedSession.id,
          userId: item.userId,
          status: item.status ?? AttendanceStatus.PRESENT,
          playerNotes: item.playerNotes ?? null,
        }),
      );

      savedAttendanceRows = await this.attendanceRepository.save(rows);
    }

    if (savedAttendanceRows.length) {
      await this.createAutomaticPracticesFromAttendance(
        course,
        savedSession,
        savedAttendanceRows,
      );
    }

    return this.sessionRepository.findOne({
      where: { id: savedSession.id },
      relations: ['attendance', 'attendance.user', 'course'],
    });
  }

  /**
   * @description Lista clases registradas para un curso específico
   * @param { string } courseId - ID del curso
   * @returns { Promise<ClassSession[]> } Clases del curso
   */
  async getCourseSessions(courseId: string): Promise<ClassSession[]> {
    await this.getCourseById(courseId);

    return this.sessionRepository.find({
      where: { courseId },
      relations: ['attendance', 'attendance.user'],
      order: {
        date: 'DESC',
        startTime: 'DESC',
      },
    });
  }

  /**
   * @description Obtiene un curso por su ID con relaciones principales
   * @param { string } courseId - ID del curso
   * @returns { Promise<Course> } Curso encontrado
   */
  async getCourseById(courseId: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['schedules', 'venue'],
    });

    if (!course) {
      throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
    }

    return course;
  }

  private async validateVenueIfNeeded(venueId?: string): Promise<void> {
    if (!venueId) {
      return;
    }

    const venue = await this.venueRepository.findOne({ where: { id: venueId } });
    if (!venue) {
      throw new NotFoundException(`Venue con ID ${venueId} no encontrado`);
    }

    if (venue.status !== BaseStatus.ACTIVE) {
      throw new BadRequestException('Solo puedes asociar cursos a venues activos');
    }
  }

  private validateSchedules(schedules: Array<{ startTime: string; endTime: string }>): void {
    for (const schedule of schedules) {
      this.validateTimeRange(schedule.startTime, schedule.endTime);
    }
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    if (start >= end) {
      throw new BadRequestException('La hora de inicio debe ser menor a la hora de fin');
    }
  }

  private validateDateRange(startDate?: string, endDate?: string): void {
    if (!startDate || !endDate) {
      return;
    }

    if (startDate > endDate) {
      throw new BadRequestException('startDate no puede ser mayor a endDate');
    }
  }

  private ensureCourseOwner(course: Course, currentUser: any): void {
    const elevatedRoles = [Role.ADMIN];
    if (
      course.ownerUserId !== currentUser.id &&
      !elevatedRoles.includes(currentUser.role)
    ) {
      throw new ForbiddenException('No tienes permisos para gestionar este curso');
    }
  }

  private ensureCourseHasStarted(course: Course): void {
    if (course.status !== CourseStatus.ACTIVE) {
      throw new BadRequestException('Solo puedes registrar clases en cursos activos');
    }

    if (!course.startDate) {
      return;
    }

    const today = this.formatDate(new Date());

    if (course.startDate > today) {
      throw new BadRequestException(
        'El curso aún no ha iniciado según su fecha de inicio',
      );
    }
  }

  private async ensureCourseHasCapacity(
    courseId: string,
    userIdToIgnore?: string,
  ): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });

    if (!course) {
      throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
    }

    if (!course.maxCapacity) {
      return;
    }

    const approved = await this.enrollmentRepository.find({
      where: {
        courseId,
        status: EnrollmentStatus.APPROVED,
      },
      select: ['userId'],
    });

    const approvedUserIds = approved
      .map((item) => item.userId)
      .filter((id) => id !== userIdToIgnore);

    if (approvedUserIds.length >= course.maxCapacity) {
      throw new BadRequestException('El curso alcanzó su cupo máximo');
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async createAutomaticPracticesFromAttendance(
    course: Course,
    session: ClassSession,
    attendanceRows: ClassSessionAttendance[],
  ): Promise<void> {
    const presentRows = attendanceRows.filter(
      (attendance) => attendance.status === AttendanceStatus.PRESENT,
    );

    if (!presentRows.length) {
      return;
    }

    const durationMinutes =
      this.timeToMinutes(session.endTime) - this.timeToMinutes(session.startTime);

    for (const attendance of presentRows) {
      const existingPractice = await this.practicesRepository.findOne({
        where: {
          userId: attendance.userId,
          sourceType: PracticeSourceType.CLASS,
          classSessionId: session.id,
        },
      });

      if (existingPractice) {
        continue;
      }

      const practice = this.practicesRepository.create({
        userId: attendance.userId,
        venueId: course.venueId ?? null,
        practiceDate: session.date,
        durationMinutes,
        playedFriendlyMatch: false,
        practicedServes: false,
        sourceType: PracticeSourceType.CLASS,
        classId: course.id,
        classSessionId: session.id,
        className: course.title,
        notes: 'Práctica creada automáticamente por asistencia a clase',
      });

      await this.practicesRepository.save(practice);
    }
  }
}
