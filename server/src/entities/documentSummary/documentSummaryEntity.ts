import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MedicalDocument } from '../medicalDocument/medicalDocumentEntity';
import { IDocumentSummary } from './documentSummaryInterface';

@Entity({ name: 'document_summaries' })
export class DocumentSummary extends BaseEntity implements IDocumentSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'document_id', unique: true })
  documentId: string;

  @OneToOne(() => MedicalDocument, (doc) => doc.summary, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'document_id' })
  document: MedicalDocument;

  @Column({ type: 'text', name: 'summary_text' })
  summaryText: string;

  @Column({ type: 'text', name: 'extracted_text' })
  extractedText: string;

  @Column({
    type: 'boolean',
    name: 'included_in_medical_summary',
    default: false,
  })
  includedInMedicalSummary: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
