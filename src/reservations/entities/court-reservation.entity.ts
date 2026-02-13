import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Court } from '@/courts/entities/court.entity';
import { User } from '@/users/user.entity';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum ReservationSourceType {
  USER = 'USER',
  CLASS = 'CLASS',
  TOURNAMENT = 'TOURNAMENT',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('court_reservations')
export class CourtReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Court, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'court_id' })
  court: Court;

  @Column({ name: 'court_id' })
  courtId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'start_time', type: 'varchar', length: 5 })
  startTime: string;

  @Column({ name: 'end_time', type: 'varchar', length: 5 })
  endTime: string;

  @Column({ name: 'players_count' })
  playersCount: number;

  @Column({ name: 'total_price', type: 'int' })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.CONFIRMED,
  })
  status: ReservationStatus;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: ReservationSourceType,
    default: ReservationSourceType.USER,
  })
  sourceType: ReservationSourceType;

  @Column({ name: 'source_id', nullable: true })
  sourceId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
