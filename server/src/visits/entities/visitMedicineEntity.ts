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
import { Medicine } from '../../medicines/entities/medicineEntity';
import { IVisitMedicine } from './visitMedicineInterface';

@Entity({ name: 'visit_medicines' })
export class VisitMedicine extends BaseEntity implements IVisitMedicine {
  @PrimaryColumn({ type: 'uuid', name: 'visit_id' })
  visitId: string;

  @PrimaryColumn({ type: 'uuid', name: 'medicine_id' })
  medicineId: string;

  @ManyToOne(() => Visit, (visit) => visit.medicines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visit_id' })
  visit: Visit;

  @ManyToOne(() => Medicine, (medicine) => medicine.visitMedicines, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'medicine_id' })
  medicine: Medicine;

  @Column({ type: 'varchar' })
  dosage: string;

  @Column({ type: 'varchar' })
  frequency: string;

  @Column({ type: 'varchar' })
  duration: string;

  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
