import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from './entities/clinicEntity';
import { ClinicInput } from './types/clinic.types';

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

  async updateClinicById(
    clinicId: string,
    clinicUpdates: Partial<ClinicInput>,
  ): Promise<Clinic> {
    const clinic = await this.getClinicById(clinicId);
    Object.assign(clinic, clinicUpdates);
    return this.clinicRepository.save(clinic);
  }

  async deleteClinicById(clinicId: string): Promise<void> {
    const result = await this.clinicRepository.delete(clinicId);
    if (!result.affected) throw new NotFoundException(`Clinic ${clinicId} not found`);
  }
}
