import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CourtAvailabilityService, TimeSlot } from '../services/court-availability.service';
import { AuthGuard } from '@/auth/auth.guard';

@Controller('courts')
@UseGuards(AuthGuard)
export class CourtAvailabilityController {
  constructor(private readonly courtAvailabilityService: CourtAvailabilityService) {}

  @Get(':courtId/availability')
  async getAvailableSlots(
    @Param('courtId') courtId: string,
    @Query('date') date: string,
  ): Promise<TimeSlot[]> {
    return this.courtAvailabilityService.getAvailableSlots(courtId, date);
  }
}
