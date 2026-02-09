import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CourtsService } from './services/courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { Court } from './entities/court.entity';
import { AuthGuard } from '@/auth/auth.guard';
import { VenueOwnershipGuard } from '@/venues/guards/venue-ownership.guard';

@Controller()
@UseGuards(AuthGuard)
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Post('venues/:venueId/courts')
  @UseGuards(VenueOwnershipGuard)
  async createCourt(
    @Param('venueId') venueId: string,
    @Body() createCourtDto: CreateCourtDto,
    @Request() req,
  ): Promise<Court> {
    return this.courtsService.createCourt(venueId, createCourtDto, req.user);
  }

  @Get('venues/:venueId/courts')
  async getCourtsByVenue(@Param('venueId') venueId: string): Promise<Court[]> {
    return this.courtsService.findCourtsByVenue(venueId);
  }
}
