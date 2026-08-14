import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from './entities/clinicEntity';
import { ClinicInput } from './types/clinic.types';
import { IUser } from '../common/types/entity-interfaces';
import { ROLE_ADMIN } from '../common/constants/roles';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
  ) {}

  getAllClinicsSummary(): Promise<Pick<Clinic, 'id' | 'name'>[]> {
    return this.clinicRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  getAllClinics(): Promise<Clinic[]> {
    return this.clinicRepository.find({ order: { name: 'ASC' } });
  }

  private getAdminClinicIdOrThrow(actingUser: IUser): string {
    if (actingUser?.role?.name !== ROLE_ADMIN) {
      throw new ForbiddenException('Only admin can perform this action');
    }
    const clinicId = actingUser.caregiver?.clinicId ?? actingUser.secretary?.clinicId;
    if (!clinicId) {
      throw new ForbiddenException('Admin is not assigned to a clinic');
    }
    return clinicId;
  }

  async getClinicById(clinicId: string): Promise<Clinic> {
    const clinic = await this.clinicRepository.findOne({ where: { id: clinicId } });
    if (!clinic) throw new NotFoundException(`Clinic ${clinicId} not found`);
    return clinic;
  }

  async createClinic(clinicInput: ClinicInput): Promise<Clinic> {
    const existingClinic = await this.clinicRepository.findOne({
      where: { name: clinicInput.name },
    });
    if (existingClinic)
      throw new ConflictException(`Clinic '${clinicInput.name}' already exists`);
    return this.clinicRepository.save(this.clinicRepository.create(clinicInput));
  }

  async createClinicAsAdmin(
    clinicInput: ClinicInput,
    actingUser: IUser,
  ): Promise<Clinic> {
    const adminClinicId = this.getAdminClinicIdOrThrow(actingUser);
    const adminClinic = await this.getClinicById(adminClinicId);

    if (clinicInput.name !== adminClinic.name) {
      throw new ForbiddenException('Cannot create another clinic outside your assignment');
    }

    return adminClinic;
  }

  async updateClinicById(
    clinicId: string,
    clinicUpdates: Partial<ClinicInput>,
  ): Promise<Clinic> {
    const clinic = await this.getClinicById(clinicId);
    Object.assign(clinic, clinicUpdates);
    return this.clinicRepository.save(clinic);
  }

  async updateClinicByIdAsAdmin(
    clinicId: string,
    clinicUpdates: Partial<ClinicInput>,
    actingUser: IUser,
  ): Promise<Clinic> {
    const adminClinicId = this.getAdminClinicIdOrThrow(actingUser);
    if (clinicId !== adminClinicId) {
      throw new ForbiddenException('Cannot edit a clinic outside your assignment');
    }
    return this.updateClinicById(clinicId, clinicUpdates);
  }

  async deleteClinicById(clinicId: string): Promise<void> {
    const result = await this.clinicRepository.delete(clinicId);
    if (!result.affected) throw new NotFoundException(`Clinic ${clinicId} not found`);
  }
}
