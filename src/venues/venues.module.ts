import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './venue.entity';
import { VenueImage } from './entities/venue-image.entity';
import { VenuesService } from './venues.service';
import { VenueImageService } from './services/venue-image.service';
import { VenuesController } from './venues.controller';
import { VenueImageController } from './controllers/venue-image.controller';
import { VenueOwnershipGuard } from './guards/venue-ownership.guard';
import { FilesModule } from '@/files/files.module';
import { FilesService } from '@/files/files.service';

@Module({
  imports: [TypeOrmModule.forFeature([Venue, VenueImage]), FilesModule],
  providers: [VenuesService, VenueImageService, VenueOwnershipGuard, FilesService],
  controllers: [VenuesController, VenueImageController],
  exports: [VenuesService, TypeOrmModule],
})
export class VenuesModule {}
