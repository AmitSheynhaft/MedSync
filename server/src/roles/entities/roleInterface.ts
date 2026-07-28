import { IUser } from '../../users/entities/userInterface';

export interface IRole {
  id: string;
  name: string;
  description: string;
  users?: IUser[];
}
