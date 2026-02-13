import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Court } from './entities/court.entity';
import { CourtSchedule } from './entities/court-schedule.entity';
import { CourtAvailability } from './entities/court-availability.entity';
import { CourtPricingRule } from './entities/court-pricing-rule.entity';
import { CourtsService } from './services/courts.service';
import { CourtScheduleService } from './services/court-schedule.service';
import { CourtAvailabilityService } from './services/court-availability.service';
import { CourtPricingService } from './services/court-pricing.service';
import { CourtsController } from './courts.controller';
import { CourtScheduleController } from './controllers/court-schedule.controller';
import { CourtAvailabilityController } from './controllers/court-availability.controller';
import { CourtPricingController } from './controllers/court-pricing.controller';
import { VenuesModule } from '@/venues/venues.module';
import { CourtReservation } from '@/reservations/entities/court-reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Court,
      CourtSchedule,
      CourtAvailability,
      CourtPricingRule,
      CourtReservation,
    ]),
    VenuesModule,
  ],
  providers: [
    CourtsService,
    CourtScheduleService,
    CourtAvailabilityService,
    CourtPricingService,
  ],
  controllers: [
    CourtsController,
    CourtScheduleController,
    CourtAvailabilityController,
    CourtPricingController,
  ],
  exports: [
    CourtsService,
    CourtScheduleService,
    CourtAvailabilityService,
    CourtPricingService,
  ],
})
export class CourtsModule {}
