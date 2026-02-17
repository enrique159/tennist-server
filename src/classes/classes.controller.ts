import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Role } from '@/users/domain/user';
import { ClassesService } from './classes.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { SearchCoursesDto } from './dto/search-courses.dto';
import { AddUserToCourseDto } from './dto/add-user-to-course.dto';
import { ReviewEnrollmentDto } from './dto/review-enrollment.dto';
import { FindCourseEnrollmentsDto } from './dto/find-course-enrollments.dto';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateCourseStatusDto } from './dto/update-course-status.dto';

@Controller('courses')
@UseGuards(AuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.COACH, Role.COURT_OWNER, Role.ADMIN)
  async createCourse(@Body() dto: CreateCourseDto, @Request() req) {
    return this.classesService.createCourse(dto, req.user);
  }

  @Get()
  async searchCourses(@Query() filters: SearchCoursesDto) {
    return this.classesService.searchCourses(filters);
  }

  @Get(':courseId')
  async getCourseById(@Param('courseId') courseId: string) {
    return this.classesService.getCourseById(courseId);
  }

  @Patch(':courseId/status')
  @UseGuards(RolesGuard)
  @Roles(Role.COACH, Role.COURT_OWNER, Role.ADMIN)
  async updateCourseStatus(
    @Param('courseId') courseId: string,
    @Body() dto: UpdateCourseStatusDto,
    @Request() req,
  ) {
    return this.classesService.updateCourseStatus(courseId, dto, req.user);
  }

  @Post(':courseId/enrollments/request')
  async requestEnrollment(@Param('courseId') courseId: string, @Request() req) {
    return this.classesService.requestEnrollment(courseId, req.user);
  }

  @Post(':courseId/enrollments/add-user')
  @UseGuards(RolesGuard)
  @Roles(Role.COACH, Role.COURT_OWNER, Role.ADMIN)
  async addUserToCourse(
    @Param('courseId') courseId: string,
    @Body() dto: AddUserToCourseDto,
    @Request() req,
  ) {
    return this.classesService.addUserToCourse(courseId, dto, req.user);
  }

  @Patch(':courseId/enrollments/:enrollmentId/review')
  @UseGuards(RolesGuard)
  @Roles(Role.COACH, Role.COURT_OWNER, Role.ADMIN)
  async reviewEnrollment(
    @Param('courseId') courseId: string,
    @Param('enrollmentId') enrollmentId: string,
    @Body() dto: ReviewEnrollmentDto,
    @Request() req,
  ) {
    return this.classesService.reviewEnrollment(courseId, enrollmentId, dto, req.user);
  }

  @Get(':courseId/enrollments')
  @UseGuards(RolesGuard)
  @Roles(Role.COACH, Role.COURT_OWNER, Role.ADMIN)
  async getCourseEnrollments(
    @Param('courseId') courseId: string,
    @Query() filters: FindCourseEnrollmentsDto,
    @Request() req,
  ) {
    return this.classesService.getCourseEnrollments(courseId, filters, req.user);
  }

  @Post(':courseId/classes')
  @UseGuards(RolesGuard)
  @Roles(Role.COACH, Role.COURT_OWNER, Role.ADMIN)
  async createClassSession(
    @Param('courseId') courseId: string,
    @Body() dto: CreateClassSessionDto,
    @Request() req,
  ) {
    return this.classesService.createClassSession(courseId, dto, req.user);
  }

  @Get(':courseId/classes')
  async getCourseSessions(@Param('courseId') courseId: string) {
    return this.classesService.getCourseSessions(courseId);
  }
}
