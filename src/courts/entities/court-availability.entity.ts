import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Court } from './court.entity';

export enum AvailabilityType {
  AVAILABLE = 'AVAILABLE',
  BLOCKED = 'BLOCKED',
}

@Entity('court_availability')
export class CourtAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({
    type: 'enum',
    enum: AvailabilityType,
  })
  type: AvailabilityType;

  @Column({ nullable: true })
  reason?: string;

  @ManyToOne(() => Court, (court) => court.availabilityOverrides, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'court_id' })
  court: Court;

  @Column({ name: 'court_id'})
  courtId: string;
}