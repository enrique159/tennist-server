import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './venue.entity';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { VenueOwnershipGuard } from './guards/venue-ownership.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Venue])],
  providers: [VenuesService, VenueOwnershipGuard],
  controllers: [VenuesController],
  exports: [VenuesService, TypeOrmModule],
})
export class VenuesModule {}
