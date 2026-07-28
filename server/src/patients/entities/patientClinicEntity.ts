import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Patient } from './patientEntity';
import { Clinic } from '../../clinics/entities/clinicEntity';
import { IPatientClinic } from './patientClinicInterface';

@Entity({ name: 'patient_clinics' })
export class PatientClinic extends BaseEntity implements IPatientClinic {
  @PrimaryColumn({ type: 'uuid', name: 'patient_id' })
  patientId: string;

  @PrimaryColumn({ type: 'uuid', name: 'clinic_id' })
  clinicId: string;

  @ManyToOne(() => Patient, (patient) => patient.patientClinics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Clinic, (clinic) => clinic.patientClinics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
