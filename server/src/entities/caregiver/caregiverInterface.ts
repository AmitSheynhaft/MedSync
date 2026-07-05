import { IUser } from '../user/userInterface';
import { ISlot } from '../slot/slotInterface';
import { IVisit } from '../visit/visitInterface';

export interface ICaregiver {
  id: string;
  userId: string;
  user?: IUser;
  licenseNumber: string;
  specialization: string;
  clinicName?: string;
  clinicId?: string;
  createdAt: Date;
  updatedAt: Date;
  slots?: ISlot[];
  visits?: IVisit[];
}
