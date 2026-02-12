import { PartialType } from '@nestjs/mapped-types';
import { CreateCourtScheduleDto } from './create-court-schedule.dto';

export class UpdateCourtScheduleDto extends PartialType(CreateCourtScheduleDto) {}
