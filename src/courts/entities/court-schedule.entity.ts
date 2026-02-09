import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Court } from './court.entity';

@Entity('court_schedules')
export class CourtSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 0 = domingo, 6 = sábado
  @Column({ name: 'day_of_week', type: 'tinyint' })
  dayOfWeek: number;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @ManyToOne(() => Court, (court) => court.schedules, {
    onDelete: 'CASCADE',
  })

  @JoinColumn({ name: 'court_id' })
  court: Court;

  @Column({ name: 'court_id' })
  courtId: string;
}