import { IUser } from '../user/userInterface';

export interface ISecretary {
  id: string;
  userId: string;
  user?: IUser;
  idNumber: string;
  clinicId: string;
  createdAt: Date;
  updatedAt: Date;
}
