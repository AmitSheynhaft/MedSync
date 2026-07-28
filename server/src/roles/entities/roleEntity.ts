import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/userEntity';
import { IRole } from './roleInterface';

@Entity({ name: 'roles' })
export class Role extends BaseEntity implements IRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
