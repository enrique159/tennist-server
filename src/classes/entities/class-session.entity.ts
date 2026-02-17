import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { ClassSessionAttendance } from './class-session-attendance.entity';

@Entity('class_sessions')
export class ClassSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course, (course) => course.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'course_id' })
  courseId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'start_time', type: 'varchar', length: 5 })
  startTime: string;

  @Column({ name: 'end_time', type: 'varchar', length: 5 })
  endTime: string;

  @Column({ name: 'general_notes', type: 'text', nullable: true })
  generalNotes?: string;

  @OneToMany(() => ClassSessionAttendance, (attendance) => attendance.session, {
    cascade: true,
  })
  attendance: ClassSessionAttendance[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
