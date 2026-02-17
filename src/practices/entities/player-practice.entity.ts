import { User } from '@/users/user.entity';
import { Venue } from '@/venues/venue.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PracticeSourceType {
  MANUAL = 'MANUAL',
  CLASS = 'CLASS',
}

@Entity('player_practices')
export class PlayerPractice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Venue, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'venue_id' })
  venue?: Venue;

  @Column({ name: 'venue_id', nullable: true })
  venueId?: string;

  @Column({ name: 'practice_date', type: 'date' })
  practiceDate: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({ name: 'played_friendly_match', default: false })
  playedFriendlyMatch: boolean;

  @Column({ name: 'practiced_serves', default: false })
  practicedServes: boolean;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: PracticeSourceType,
    default: PracticeSourceType.MANUAL,
  })
  sourceType: PracticeSourceType;

  @Column({ name: 'class_id', nullable: true })
  classId?: string;

  @Column({ name: 'class_session_id', nullable: true })
  classSessionId?: string;

  @Column({ name: 'class_name', nullable: true })
  className?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
