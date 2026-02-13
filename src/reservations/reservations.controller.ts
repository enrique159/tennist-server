import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AuthGuard } from '@/auth/auth.guard';

@Controller()
@UseGuards(AuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('courts/:courtId/reservations')
  async createReservation(
    @Param('courtId') courtId: string,
    @Body() createReservationDto: CreateReservationDto,
    @Request() req,
  ) {
    return this.reservationsService.createReservation(
      courtId,
      createReservationDto,
      req.user,
    );
  }

  @Get('users/me/reservations')
  async getMyReservations(@Request() req) {
    return this.reservationsService.getUserReservations(req.user.id);
  }

  @Delete('reservations/:id')
  async cancelReservation(@Param('id') id: string, @Request() req) {
    return this.reservationsService.cancelReservation(id, req.user);
  }
}
