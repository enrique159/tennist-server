import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Court } from './entities/court.entity';
import { CourtSchedule } from './entities/court-schedule.entity';
import { CourtAvailability } from './entities/court-availability.entity';
import { CourtPricingRule } from './entities/court-pricing-rule.entity';
import { CourtsService } from './services/courts.service';
import { CourtAvailabilityService } from './services/court-availability.service';
import { CourtPricingService } from './services/court-pricing.service';
import { CourtsController } from './courts.controller';
import { CourtAvailabilityController } from './controllers/court-availability.controller';
import { VenuesModule } from '@/venues/venues.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Court,
      CourtSchedule,
      CourtAvailability,
      CourtPricingRule,
    ]),
    VenuesModule,
  ],
  providers: [
    CourtsService,
    CourtAvailabilityService,
    CourtPricingService,
  ],
  controllers: [
    CourtsController,
    CourtAvailabilityController,
  ],
  exports: [
    CourtsService,
    CourtAvailabilityService,
    CourtPricingService,
  ],
})
export class CourtsModule {}
