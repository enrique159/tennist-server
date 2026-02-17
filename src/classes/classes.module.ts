import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './classes.controller';
import { ClassesPlayerController } from './classes-player.controller';
import { ClassesService } from './classes.service';
import { Course } from './entities/course.entity';
import { CourseSchedule } from './entities/course-schedule.entity';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { ClassSession } from './entities/class-session.entity';
import { ClassSessionAttendance } from './entities/class-session-attendance.entity';
import { Venue } from '@/venues/venue.entity';
import { PlayerPractice } from '@/practices/entities/player-practice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseSchedule,
      CourseEnrollment,
      ClassSession,
      ClassSessionAttendance,
      Venue,
      PlayerPractice,
    ]),
  ],
  controllers: [ClassesController, ClassesPlayerController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
