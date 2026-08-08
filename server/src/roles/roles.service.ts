import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/roleEntity';

export interface RoleInput {
  name: string;
  description: string;
}

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({ order: { name: 'ASC' } });
  }

  async getRoleById(roleId: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Role ${roleId} not found`);
    return role;
  }

  async getRoleByName(roleName: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { name: roleName } });
    if (!role) {
      throw new NotFoundException(`Role '${roleName}' not found`);
    }
    return role;
  }

  async createRole(roleInput: RoleInput): Promise<Role> {
    if (!roleInput?.name) throw new ConflictException('Role name is required');
    const existingRole = await this.roleRepository.findOne({
      where: { name: roleInput.name },
    });
    if (existingRole)
      throw new ConflictException(`Role '${roleInput.name}' already exists`);
    return this.roleRepository.save(this.roleRepository.create(roleInput));
  }

  async updateRoleById(
    roleId: string,
    roleUpdates: Partial<RoleInput>,
  ): Promise<Role> {
    const role = await this.getRoleById(roleId);
    Object.assign(role, roleUpdates);
    return this.roleRepository.save(role);
  }

  async deleteRoleById(roleId: string): Promise<void> {
    const deleteResult = await this.roleRepository.delete(roleId);
    if (!deleteResult.affected)
      throw new NotFoundException(`Role ${roleId} not found`);
  }
}
