import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/auth/auth.guard';
import { PracticesService } from './practices.service';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { FindPracticesDto } from './dto/find-practices.dto';

@Controller('users/me/practices')
@UseGuards(AuthGuard)
export class PracticesController {
  constructor(private readonly practicesService: PracticesService) {}

  @Post()
  async createPractice(@Body() createPracticeDto: CreatePracticeDto, @Request() req) {
    return this.practicesService.createPractice(createPracticeDto, req.user);
  }

  @Get()
  async getMyPractices(@Request() req, @Query() filters: FindPracticesDto) {
    return this.practicesService.getMyPractices(req.user.id, filters);
  }

  @Get('stats')
  async getMyPracticeStats(@Request() req, @Query() filters: FindPracticesDto) {
    return this.practicesService.getMyPracticeStats(req.user.id, filters);
  }
}
