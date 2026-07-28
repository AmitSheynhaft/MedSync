import { IUser } from '../../users/entities/userInterface';
import { ISlot } from '../../slots/entities/slotInterface';
import { IVisit } from '../../visits/entities/visitInterface';

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
