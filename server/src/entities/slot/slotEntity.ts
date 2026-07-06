import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Patient } from '../patient/patientEntity';
import { Caregiver } from '../caregiver/caregiverEntity';
import { Visit } from '../visit/visitEntity';
import { ISlot } from './slotInterface';
import { SlotStatus } from './slotStatus';

@Entity({ name: 'slots' })
@Index(['caregiverId', 'slotTime'])
export class Slot extends BaseEntity implements ISlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'uuid', name: 'caregiver_id' })
  caregiverId: string;

  @ManyToOne(() => Caregiver, (caregiver) => caregiver.slots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'caregiver_id' })
  caregiver: Caregiver;

  @Column({ type: 'timestamp', name: 'slot_time' })
  slotTime: Date;

  @Column({ type: 'boolean', name: 'has_referral', default: false })
  hasReferral: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'status',
    default: SlotStatus.SCHEDULED,
  })
  status: SlotStatus;

  // Audit only: the staff user (e.g. secretary) who booked the slot. This is
  // never the owner of the appointment — ownership is `patientId`.
  @Column({ type: 'uuid', name: 'created_by_user_id', nullable: true })
  createdByUserId?: string;

  // Audit only: the user who cancelled the slot.
  @Column({ type: 'uuid', name: 'cancelled_by_user_id', nullable: true })
  cancelledByUserId?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToOne(() => Visit, (visit) => visit.slot)
  visit?: Visit;
}
