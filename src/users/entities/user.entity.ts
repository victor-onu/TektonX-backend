import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MENTEE })
  role: UserRole;

  @Column({ type: 'varchar', default: UserStatus.INACTIVE })
  status: UserStatus;

  @Column({ name: 'application_status', type: 'varchar', nullable: true })
  applicationStatus: ApplicationStatus | null;

  @Column()
  track: string;

  @Column({ nullable: true })
  whatsapp: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  title: string;

  @Column({ name: 'profile_photo_url', nullable: true })
  profilePhotoUrl: string;

  @Column({ name: 'experience_years', type: 'int', nullable: true })
  experienceYears: number;

  @Column({ name: 'linkedin_url', nullable: true })
  linkedinUrl: string;

  @Column({ name: 'cohort_id', type: 'uuid', nullable: true })
  cohortId: string | null;

  @Column({ name: 'invite_token', type: 'varchar', nullable: true })
  inviteToken: string | null;

  @Column({ name: 'invite_token_expiry', type: 'timestamptz', nullable: true })
  inviteTokenExpiry: Date | null;

  @Column({ name: 'milestone1_completed', type: 'int', default: 0 })
  milestone1Completed: number;

  @Column({ name: 'milestone2_completed', type: 'int', default: 0 })
  milestone2Completed: number;

  @Column({ name: 'milestone3_completed', type: 'int', default: 0 })
  milestone3Completed: number;

  @Column({
    name: 'email_notifications',
    type: 'jsonb',
    default: () => `'{"announcements":true,"sessionReminders":true,"weeklyProgress":false,"milestoneCompletions":true}'`,
  })
  emailNotifications: {
    announcements: boolean;
    sessionReminders: boolean;
    weeklyProgress: boolean;
    milestoneCompletions: boolean;
  };

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  async validatePassword(plainText: string): Promise<boolean> {
    return bcrypt.compare(plainText, this.passwordHash);
  }

  toPublicProfile() {
    return {
      id: this.id,
      name: this.name,
      track: this.track,
      bio: this.bio,
      title: this.title,
      profilePhotoUrl: this.profilePhotoUrl,
      linkedinUrl: this.linkedinUrl,
    };
  }

  toJSON() {
    const { passwordHash, ...rest } = this as any;
    return rest;
  }
}
