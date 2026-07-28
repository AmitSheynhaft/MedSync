import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PatientClinic } from '../../patients/entities/patientClinicEntity';
import { IClinic } from './clinicInterface';

@Entity({ name: 'clinics' })
export class Clinic extends BaseEntity implements IClinic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  address?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => PatientClinic, (patientClinic) => patientClinic.clinic)
  patientClinics: PatientClinic[];
}
