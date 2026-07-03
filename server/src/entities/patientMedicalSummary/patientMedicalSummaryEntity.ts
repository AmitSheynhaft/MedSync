import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../patient/patientEntity';
import { IPatientMedicalSummary } from './patientMedicalSummaryInterface';

@Entity({ name: 'patient_medical_summaries' })
export class PatientMedicalSummary
  extends BaseEntity
  implements IPatientMedicalSummary
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'patient_id', unique: true })
  patientId: string;

  @OneToOne(() => Patient, (patient) => patient.medicalSummary, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'text', name: 'summary_text' })
  summaryText: string;

  @Column({ type: 'timestamp', name: 'generated_at' })
  generatedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
