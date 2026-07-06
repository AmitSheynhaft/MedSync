import { IPatient } from '../patient/patientInterface';
import { ICaregiver } from '../caregiver/caregiverInterface';
import { IVisit } from '../visit/visitInterface';
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
