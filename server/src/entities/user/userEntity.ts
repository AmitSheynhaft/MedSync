import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../role/roleEntity';
import { Patient } from '../patient/patientEntity';
import { Caregiver } from '../caregiver/caregiverEntity';
import { Secretary } from '../secretary/secretaryEntity';
import { IUser } from './userInterface';

@Entity({ name: 'users' })
export class User extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role, (role) => role.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'varchar', name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'date', name: 'birth_date', nullable: true })
  birthDate: Date;

  @Column({ type: 'varchar', nullable: true })
  gender: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => Patient, (patient) => patient.user)
  patient?: Patient;

  @OneToOne(() => Caregiver, (caregiver) => caregiver.user)
  caregiver?: Caregiver;

  @OneToOne(() => Secretary, (secretary) => secretary.user)
  secretary?: Secretary;
}
