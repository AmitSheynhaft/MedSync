import { IVisit } from './visitInterface';
import { IMedicine } from '../../medicines/entities/medicineInterface';

export interface IVisitMedicine {
  visitId: string;
  medicineId: string;
  visit?: IVisit;
  medicine?: IMedicine;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  createdAt: Date;
}
