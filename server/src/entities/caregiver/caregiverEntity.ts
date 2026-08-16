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
import { User } from '../user/userEntity';
import { Slot } from '../slot/slotEntity';
import { Visit } from '../visit/visitEntity';
import { Clinic } from '../clinic/clinicEntity';
import { ICaregiver } from './caregiverInterface';

@Entity({ name: 'caregivers' })
export class Caregiver extends BaseEntity implements ICaregiver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.caregiver, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', name: 'license_number', unique: true, nullable: true })
  licenseNumber?: string | null;

  @Column({ type: 'varchar', nullable: true })
  specialization?: string | null;

  @Column({ type: 'varchar', name: 'clinic_name', nullable: true })
  clinicName?: string;

  @Column({ type: 'uuid', name: 'clinic_id', nullable: true })
  clinicId?: string;

  @ManyToOne(() => Clinic, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clinic_id' })
  clinic?: Clinic;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Slot, (slot) => slot.caregiver)
  slots: Slot[];

  @OneToMany(() => Visit, (visit) => visit.caregiver)
  visits: Visit[];
}
