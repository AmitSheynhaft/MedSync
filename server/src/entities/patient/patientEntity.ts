import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/userEntity';
import { Slot } from '../slot/slotEntity';
import { MedicalDocument } from '../medicalDocument/medicalDocumentEntity';
import { Visit } from '../visit/visitEntity';
import { PatientMedicalSummary } from '../patientMedicalSummary/patientMedicalSummaryEntity';
import { PatientClinicalAlert } from '../patientClinicalAlert/patientClinicalAlertEntity';
import { IPatient } from './patientInterface';

@Entity({ name: 'patients' })
export class Patient extends BaseEntity implements IPatient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', name: 'id_number', nullable: true, unique: true })
  idNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  hmo?: string;

  @Column({ type: 'varchar', name: 'blood_type', nullable: true })
  bloodType?: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Slot, (slot) => slot.patient)
  slots: Slot[];

  @OneToMany(() => MedicalDocument, (doc) => doc.patient)
  documents: MedicalDocument[];

  @OneToMany(() => Visit, (visit) => visit.patient)
  visits: Visit[];

  @OneToOne(() => PatientMedicalSummary, (s) => s.patient)
  medicalSummary: PatientMedicalSummary;

  @OneToMany(() => PatientClinicalAlert, (alert) => alert.patient)
  clinicalAlerts: PatientClinicalAlert[];
}
