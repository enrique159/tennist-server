import { Controller, Post, Get, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { FindNearbyVenuesDto } from './dto/find-nearby-venues.dto';
import { Venue, VenueType } from './venue.entity';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Role } from '@/users/domain/user';

@Controller('venues')
@UseGuards(AuthGuard)
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COURT_OWNER)
  async createVenue(@Body() createVenueDto: CreateVenueDto, @Request() req): Promise<Venue> {
    if (createVenueDto.type === VenueType.PUBLIC) {
      if (req.user.role !== Role.ADMIN) {
        throw new Error('Solo usuarios ADMIN pueden crear venues PÚBLICOS');
      }
      return this.venuesService.createPublicVenue(createVenueDto);
    }

    if (createVenueDto.type === VenueType.PRIVATE) {
      if (req.user.role !== Role.COURT_OWNER && req.user.role !== Role.ADMIN) {
        throw new Error('Solo usuarios CLUB_OWNER o ADMIN pueden crear venues PRIVADOS');
      }
      return this.venuesService.createPrivateVenue(createVenueDto, req.user.id);
    }

    throw new Error('Tipo de venue inválido');
  }

  @Get('nearby')
  async getNearbyVenues(@Query() filters: FindNearbyVenuesDto): Promise<Array<Venue & { distance: number }>> {
    return this.venuesService.findNearby(filters);
  }

  @Get(':id')
  async getVenue(@Param('id') id: string): Promise<Venue> {
    return this.venuesService.findById(id);
  }
}
