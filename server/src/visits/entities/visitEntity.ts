import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patientEntity';
import { Caregiver } from '../../caregivers/entities/caregiverEntity';
import { Slot } from '../../slots/entities/slotEntity';
import { VisitRecording } from './visitRecordingEntity';
import { VisitSummary } from './visitSummaryEntity';
import { VisitDiagnosis } from './visitDiagnosisEntity';
import { VisitMedicine } from './visitMedicineEntity';
import { VisitType } from '../../common/constants/domain-enums';
import { IVisit } from './visitInterface';

@Entity({ name: 'visits' })
export class Visit extends BaseEntity implements IVisit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.visits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'uuid', name: 'caregiver_id' })
  caregiverId: string;

  @ManyToOne(() => Caregiver, (caregiver) => caregiver.visits, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'caregiver_id' })
  caregiver: Caregiver;

  @Column({ type: 'uuid', name: 'slot_id', nullable: true, unique: true })
  slotId?: string;

  @ManyToOne(() => Slot, (slot) => slot.visit, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'slot_id' })
  slot?: Slot;

  @Column({ type: 'timestamp', name: 'visit_date' })
  visitDate: Date;

  @Column({ type: 'text', name: 'blood_pressure', nullable: true })
  bloodPressure?: string;

  @Column({ type: 'text', nullable: true })
  pulse?: string;

  @Column({ type: 'text', name: 'body_temp', nullable: true })
  bodyTemp?: string;

  @Column({ type: 'text', nullable: true })
  weight?: string;

  @Column({ type: 'text', nullable: true })
  height?: string;

  @Column({ type: 'text', name: 'oxygen_sat', nullable: true })
  oxygenSat?: string;

  @Column({ type: 'text', name: 'chief_complaint', nullable: true })
  chiefComplaint?: string;

  @Column({ type: 'varchar', name: 'visit_type', nullable: true })
  visitType?: VisitType;

  @Column({ type: 'date', name: 'follow_up_date', nullable: true })
  followUpDate?: string;

  @Column({ type: 'text', name: 'referral_notes', nullable: true })
  referralNotes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => VisitRecording, (rec) => rec.visit)
  recording?: VisitRecording;

  @OneToOne(() => VisitSummary, (summary) => summary.visit)
  summary?: VisitSummary;

  @OneToMany(() => VisitDiagnosis, (vd) => vd.visit)
  diagnoses: VisitDiagnosis[];

  @OneToMany(() => VisitMedicine, (vm) => vm.visit)
  medicines: VisitMedicine[];
}
