import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column()
  track: string;

  @Index({ unique: true })
  @Column({ name: 'verification_code', unique: true })
  verificationCode: string;

  @Column({ name: 'completed_at', type: 'timestamptz' })
  completedAt: Date;

  @Column({ name: 'pdf_url', nullable: true })
  pdfUrl: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
