import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Visit } from '../visit/visitEntity';
import { VisitSummaryType } from '../enums';
import { IVisitSummary } from './visitSummaryInterface';

@Entity({ name: 'visit_summaries' })
export class VisitSummary extends BaseEntity implements IVisitSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'visit_id', unique: true })
  visitId: string;

  @OneToOne(() => Visit, (visit) => visit.summary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visit_id' })
  visit: Visit;

  @Column({ type: 'text', name: 'summary_text' })
  summaryText: string;

  @Column({
    type: 'enum',
    enum: VisitSummaryType,
    name: 'visit_type',
  })
  visitType: VisitSummaryType;

  @Column({
    type: 'boolean',
    name: 'included_in_medical_summary',
    default: false,
  })
  includedInMedicalSummary: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
