import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VisitDiagnosis } from '../../visits/entities/visitDiagnosisEntity';
import { IDiagnosis } from './diagnosisInterface';

@Entity({ name: 'diagnoses' })
export class Diagnosis extends BaseEntity implements IDiagnosis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  description: string;

  @OneToMany(() => VisitDiagnosis, (vd) => vd.diagnosis)
  visitDiagnoses: VisitDiagnosis[];
}
