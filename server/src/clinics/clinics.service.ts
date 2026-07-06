import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from '../entities/clinic/clinicEntity';

export interface ClinicInput {
  name: string;
  address?: string;
}

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic) private readonly clinics: Repository<Clinic>,
  ) {}

  findAll(): Promise<Pick<Clinic, 'id' | 'name'>[]> {
    return this.clinics.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }

  findAllFull(): Promise<Clinic[]> {
    return this.clinics.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Clinic> {
    const clinic = await this.clinics.findOne({ where: { id } });
    if (!clinic) throw new NotFoundException(`Clinic ${id} not found`);
    return clinic;
  }

  async create(input: ClinicInput): Promise<Clinic> {
    const existing = await this.clinics.findOne({ where: { name: input.name } });
    if (existing) throw new ConflictException(`Clinic '${input.name}' already exists`);
    return this.clinics.save(this.clinics.create(input));
  }

  async update(id: string, input: Partial<ClinicInput>): Promise<Clinic> {
    const clinic = await this.findOne(id);
    Object.assign(clinic, input);
    return this.clinics.save(clinic);
  }

  async remove(id: string): Promise<void> {
    const result = await this.clinics.delete(id);
    if (!result.affected) throw new NotFoundException(`Clinic ${id} not found`);
  }
}
