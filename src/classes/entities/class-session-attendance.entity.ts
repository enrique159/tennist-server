import { User } from '@/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ClassSession } from './class-session.entity';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}

@Entity('class_session_attendance')
@Unique(['sessionId', 'userId'])
export class ClassSessionAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ClassSession, (session) => session.attendance, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: ClassSession;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ name: 'player_notes', type: 'text', nullable: true })
  playerNotes?: string;
}
