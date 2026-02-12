import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Court } from '@/courts/entities/court.entity';
import { VenueImage } from './entities/venue-image.entity';
import { BaseStatus } from '@/shared/domain/status';

export enum VenueType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  address: string;

  @Column('decimal', { precision: 10, scale: 7 })
  lat: number;

  @Column('decimal', { precision: 10, scale: 7 })
  lng: number;

  @Column({
    type: 'enum',
    enum: VenueType,
  })
  type: VenueType;

  @Column({ name: 'owner_user_id', nullable: true })
  ownerUserId?: string;

  @Column({ name: 'created_by_admin', default: false })
  createdByAdmin: boolean;

  @Column({ type: 'enum', enum: BaseStatus, default: BaseStatus.ACTIVE })
  status: BaseStatus

  @OneToMany(() => Court, (court) => court.venue)
  courts: Court[];

  @OneToMany(() => VenueImage, (image) => image.venue)
  images: VenueImage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}