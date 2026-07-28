import { IPatient } from '../../patients/entities/patientInterface';
import { ICaregiver } from '../../caregivers/entities/caregiverInterface';
import { IVisit } from '../../visits/entities/visitInterface';
import { SlotStatus } from './slotStatus';

export interface ISlot {
  id: string;
  patientId: string;
  patient?: IPatient;
  caregiverId: string;
  caregiver?: ICaregiver;
  slotTime: Date;
  hasReferral: boolean;
  status: SlotStatus;
  createdByUserId?: string;
  cancelledByUserId?: string;
  createdAt: Date;
  visit?: IVisit;
}
