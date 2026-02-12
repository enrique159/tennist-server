import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { CourtAvailabilityService, TimeSlot } from '../services/court-availability.service';
import { CreateCourtAvailabilityDto } from '../dto/create-court-availability.dto';
import { CourtAvailability } from '../entities/court-availability.entity';
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

  @Post(':courtId/availability-exceptions')
  async createException(
    @Param('courtId') courtId: string,
    @Body() createAvailabilityDto: CreateCourtAvailabilityDto,
    @Request() req,
  ): Promise<CourtAvailability> {
    return this.courtAvailabilityService.createException(courtId, createAvailabilityDto, req.user);
  }

  @Get(':courtId/availability-exceptions')
  async getExceptions(@Param('courtId') courtId: string): Promise<CourtAvailability[]> {
    return this.courtAvailabilityService.findExceptionsByCourtId(courtId);
  }

  @Delete('availability-exceptions/:availabilityId')
  async deleteException(
    @Param('availabilityId') availabilityId: string,
    @Request() req,
  ): Promise<void> {
    return this.courtAvailabilityService.deleteException(availabilityId, req.user);
  }
}
