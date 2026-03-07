import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('mentor_assignments')
export class MentorAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mentor_id', type: 'uuid' })
  mentorId: string;

  @Index({ unique: true })
  @Column({ name: 'mentee_id', type: 'uuid', unique: true })
  menteeId: string;

  @Column({ name: 'assigned_by', type: 'uuid' })
  assignedBy: string;

  @Column({ name: 'cohort_id', type: 'uuid', nullable: true })
  cohortId: string | null;

  @CreateDateColumn({ name: 'assigned_at', type: 'timestamptz' })
  assignedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentor_id' })
  mentor: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentee_id' })
  mentee: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_by' })
  admin: User;
}
