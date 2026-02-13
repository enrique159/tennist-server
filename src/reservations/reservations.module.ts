import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourtReservation } from './entities/court-reservation.entity';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { CourtsModule } from '@/courts/courts.module';
import { Court } from '@/courts/entities/court.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourtReservation, Court]),
    CourtsModule,
  ],
  providers: [ReservationsService],
  controllers: [ReservationsController],
  exports: [ReservationsService],
})
export class ReservationsModule {}
