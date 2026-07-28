import { IVisit } from './visitInterface';
import { RecordingStatus } from '../../common/constants/domain-enums';

export interface IVisitRecording {
  id: string;
  visitId: string;
  visit?: IVisit;
  status: RecordingStatus;
  audioUrl: string;
  transcriptText?: string;
  createdAt: Date;
  updatedAt: Date;
}
