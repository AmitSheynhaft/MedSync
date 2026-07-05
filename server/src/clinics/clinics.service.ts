import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from '../entities/clinic/clinicEntity';

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
}
