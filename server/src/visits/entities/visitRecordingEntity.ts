import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Visit } from './visitEntity';
import { RecordingStatus } from '../../common/constants/domain-enums';
import { IVisitRecording } from './visitRecordingInterface';

@Entity({ name: 'visit_recordings' })
export class VisitRecording extends BaseEntity implements IVisitRecording {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'visit_id', unique: true })
  visitId: string;

  @OneToOne(() => Visit, (visit) => visit.recording, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visit_id' })
  visit: Visit;

  @Column({
    type: 'enum',
    enum: RecordingStatus,
    default: RecordingStatus.PENDING,
  })
  status: RecordingStatus;

  @Column({ type: 'varchar', name: 'audio_url' })
  audioUrl: string;

  @Column({ type: 'text', name: 'transcript_text', nullable: true })
  transcriptText?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
