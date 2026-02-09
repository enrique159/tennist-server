import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Court } from './court.entity';

export enum PricingType {
  PER_HOUR = 'PER_HOUR',
  PER_PERSON = 'PER_PERSON',
}

@Entity('court_pricing_rules')
export class CourtPricingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'pricing_type',
    type: 'enum',
    enum: PricingType,
  })
  pricingType: PricingType;

  // En centavos
  @Column()
  price: number;

  @Column({ name: 'max_players', nullable: true })
  maxPlayers?: number;

  @Column({ name: 'min_duration_minutes', default: 60 })
  minDurationMinutes: number;

  @Column({ name: 'max_duration_minutes', nullable: true })
  maxDurationMinutes?: number;

  @ManyToOne(() => Court, (court) => court.pricingRules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'court_id' })
  court: Court;

  @Column({ name: 'court_id' })
  courtId: string;
}