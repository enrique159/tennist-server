import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/auth/auth.guard';
import { ClassesService } from './classes.service';
import { FindMyClassSessionsDto } from './dto/find-my-class-sessions.dto';

@Controller('users/me')
@UseGuards(AuthGuard)
export class ClassesPlayerController {
  constructor(private readonly classesService: ClassesService) {}

  @Get('courses')
  async getMyCourses(@Request() req) {
    return this.classesService.getMyCourses(req.user.id);
  }

  @Get('classes')
  async getMyClassSessions(
    @Request() req,
    @Query() filters: FindMyClassSessionsDto,
  ) {
    return this.classesService.getMyClassSessions(req.user.id, filters);
  }
}
