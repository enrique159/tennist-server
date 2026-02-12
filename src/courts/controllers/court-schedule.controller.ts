import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CourtScheduleService } from '../services/court-schedule.service';
import { CreateCourtScheduleDto } from '../dto/create-court-schedule.dto';
import { UpdateCourtScheduleDto } from '../dto/update-court-schedule.dto';
import { CourtSchedule } from '../entities/court-schedule.entity';
import { AuthGuard } from '@/auth/auth.guard';

@Controller('courts')
@UseGuards(AuthGuard)
export class CourtScheduleController {
  constructor(private readonly courtScheduleService: CourtScheduleService) {}

  @Post(':courtId/schedules')
  async createSchedule(
    @Param('courtId') courtId: string,
    @Body() createScheduleDto: CreateCourtScheduleDto,
    @Request() req,
  ): Promise<CourtSchedule> {
    return this.courtScheduleService.create(courtId, createScheduleDto, req.user);
  }

  @Get(':courtId/schedules')
  async getSchedules(@Param('courtId') courtId: string): Promise<CourtSchedule[]> {
    return this.courtScheduleService.findByCourtId(courtId);
  }

  @Put('schedules/:scheduleId')
  async updateSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() updateScheduleDto: UpdateCourtScheduleDto,
    @Request() req,
  ): Promise<CourtSchedule> {
    return this.courtScheduleService.update(scheduleId, updateScheduleDto, req.user);
  }

  @Delete('schedules/:scheduleId')
  async deleteSchedule(@Param('scheduleId') scheduleId: string, @Request() req): Promise<void> {
    return this.courtScheduleService.delete(scheduleId, req.user);
  }
}
