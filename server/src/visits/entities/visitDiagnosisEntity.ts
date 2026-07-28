import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Visit } from './visitEntity';
import { Diagnosis } from '../../diagnoses/entities/diagnosisEntity';
import { IVisitDiagnosis } from './visitDiagnosisInterface';

@Entity({ name: 'visit_diagnoses' })
export class VisitDiagnosis extends BaseEntity implements IVisitDiagnosis {
  @PrimaryColumn({ type: 'uuid', name: 'visit_id' })
  visitId: string;

  @PrimaryColumn({ type: 'uuid', name: 'diagnosis_id' })
  diagnosisId: string;

  @ManyToOne(() => Visit, (visit) => visit.diagnoses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visit_id' })
  visit: Visit;

  @ManyToOne(() => Diagnosis, (diagnosis) => diagnosis.visitDiagnoses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'diagnosis_id' })
  diagnosis: Diagnosis;

  @Column({ type: 'varchar', nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
