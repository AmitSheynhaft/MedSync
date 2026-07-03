import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../patient/patientEntity';
import {
  ClinicalAlertCategory,
  ClinicalAlertSeverity,
  ClinicalAlertSource,
} from '../enums';
import { IPatientClinicalAlert } from './patientClinicalAlertInterface';

@Entity({ name: 'patient_clinical_alerts' })
@Unique('UQ_patient_clinical_alerts_dedupe', [
  'patientId',
  'category',
  'normalizedKey',
])
export class PatientClinicalAlert
  extends BaseEntity
  implements IPatientClinicalAlert
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_patient_clinical_alerts_patient_id')
  @Column({ type: 'uuid', name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.clinicalAlerts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({
    type: 'enum',
    enum: ClinicalAlertCategory,
    enumName: 'clinical_alert_category_enum',
  })
  category: ClinicalAlertCategory;

  @Column({
    type: 'enum',
    enum: ClinicalAlertSeverity,
    enumName: 'clinical_alert_severity_enum',
  })
  severity: ClinicalAlertSeverity;

  @Column({ type: 'varchar', length: 80 })
  label: string;

  @Column({ type: 'varchar', length: 120, name: 'normalized_key' })
  normalizedKey: string;

  @Column({
    type: 'enum',
    enum: ClinicalAlertSource,
    enumName: 'clinical_alert_source_enum',
    default: ClinicalAlertSource.AI,
  })
  source: ClinicalAlertSource;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
