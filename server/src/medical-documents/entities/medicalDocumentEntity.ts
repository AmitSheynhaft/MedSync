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
import { Patient } from '../../patients/entities/patientEntity';
import { User } from '../../users/entities/userEntity';
import { DocumentType, SummaryStatus } from '../../common/constants/domain-enums';
import { DocumentSummary } from '../../documents/entities/documentSummaryEntity';
import { IMedicalDocument } from './medicalDocumentInterface';

@Entity({ name: 'medical_documents' })
export class MedicalDocument extends BaseEntity implements IMedicalDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'uuid', name: 'uploaded_by_user_id' })
  uploadedByUserId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploadedBy: User;

  @Column({
    type: 'enum',
    enum: SummaryStatus,
    name: 'summary_status',
  })
  summaryStatus: SummaryStatus;

  @Column({
    type: 'enum',
    enum: DocumentType,
    name: 'document_type',
    nullable: true,
  })
  documentType?: DocumentType;

  @Column({ type: 'varchar', name: 'file_name' })
  fileName: string;

  @Column({ type: 'varchar', name: 'file_url' })
  fileUrl: string;

  @Column({ type: 'varchar', name: 'file_format', nullable: true })
  fileFormat?: string;

  @CreateDateColumn({ name: 'uploaded_at', type: 'timestamp' })
  uploadedAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'int', name: 'processing_count', default: 0 })
  processingCount: number;

  @Column({ type: 'bytea', name: 'file_data', nullable: true })
  fileData?: Buffer;

  @OneToOne(() => DocumentSummary, (summary) => summary.document)
  summary?: DocumentSummary;
}
