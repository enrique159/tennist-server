import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerPractice } from './entities/player-practice.entity';
import { PracticesService } from './practices.service';
import { PracticesController } from './practices.controller';
import { Venue } from '@/venues/venue.entity';
import { ClassSession } from '@/classes/entities/class-session.entity';
import { ClassSessionAttendance } from '@/classes/entities/class-session-attendance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlayerPractice,
      Venue,
      ClassSession,
      ClassSessionAttendance,
    ]),
  ],
  providers: [PracticesService],
  controllers: [PracticesController],
})
export class PracticesModule {}
