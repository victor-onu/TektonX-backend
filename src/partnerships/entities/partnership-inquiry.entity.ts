import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('partnership_inquiries')
export class PartnershipInquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  companyName: string

  @Column()
  contactName: string

  @Column()
  email: string

  @Column({ nullable: true })
  phone: string | null

  @Column()
  partnershipType: string  // 'sponsor' | 'hiring' | 'both'

  @Column({ nullable: true, type: 'text' })
  message: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
