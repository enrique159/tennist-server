import { Base } from '@/shared/domain/base';
import { Venue } from '@/venues/venue.entity';
import { CourtSchedule } from './court-schedule.entity';
import { CourtAvailability } from './court-availability.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourtPricingRule } from './court-pricing-rule.entity';

export enum CourtSurface {
  HARD = 'HARD',
  CLAY = 'CLAY',
  GRASS = 'GRASS',
  SYNTHETIC = 'SYNTHETIC',
}

@Entity('courts')
export class Court implements Base {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CourtSurface,
  })
  surface: CourtSurface;

  @Column({ name: 'is_indoor', default: false })
  isIndoor: boolean;

  @Column({ name: 'is_lighted', default: false })
  isLighted: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Venue, (venue) => venue.courts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @Column({ name: 'venue_id' })
  venueId: string;

  @OneToMany(() => CourtSchedule, (schedule) => schedule.court)
  schedules: CourtSchedule[];

  @OneToMany(() => CourtAvailability, (availability) => availability.court)
  availabilityOverrides: CourtAvailability[];

  @OneToMany(() => CourtPricingRule, (pricing) => pricing.court)
  pricingRules: CourtPricingRule[];

  @CreateDateColumn({ name: 'created_at' })
  readonly createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  readonly updatedAt: Date;
}
