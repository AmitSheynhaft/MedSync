import { IVisitMedicine } from '../../visits/entities/visitMedicineInterface';

export interface IMedicine {
  id: string;
  name: string;
  visitMedicines?: IVisitMedicine[];
}
