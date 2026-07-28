import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnosis } from '../entities/diagnosis/diagnosisEntity';

export interface DiagnosisInput {
  code: string;
  description: string;
}

@Injectable()
export class DiagnosesService {
  constructor(
    @InjectRepository(Diagnosis)
    private readonly diagnosisRepository: Repository<Diagnosis>,
  ) {}

  getAllDiagnoses(searchQuery?: string): Promise<Diagnosis[]> {
    const diagnosesQueryBuilder = this.diagnosisRepository.createQueryBuilder('d');
    if (searchQuery?.trim()) {
      diagnosesQueryBuilder.where('d.code ILIKE :q OR d.description ILIKE :q', {
        q: `%${searchQuery.trim()}%`,
      });
    }
    return diagnosesQueryBuilder.orderBy('d.code', 'ASC').getMany();
  }

  async getDiagnosisById(diagnosisId: string): Promise<Diagnosis> {
    const diagnosis = await this.diagnosisRepository.findOne({
      where: { id: diagnosisId },
    });
    if (!diagnosis)
      throw new NotFoundException(`Diagnosis ${diagnosisId} not found`);
    return diagnosis;
  }

  async getOrCreateDiagnosisByCode(
    diagnosisCode: string,
    diagnosisDescription = '',
  ): Promise<Diagnosis> {
    const existingDiagnosis = await this.diagnosisRepository.findOne({
      where: { code: diagnosisCode },
    });
    if (existingDiagnosis) return existingDiagnosis;
    return this.diagnosisRepository.save(
      this.diagnosisRepository.create({
        code: diagnosisCode,
        description: diagnosisDescription,
      }),
    );
  }

  async createDiagnosis(diagnosisInput: DiagnosisInput): Promise<Diagnosis> {
    if (!diagnosisInput?.code || !diagnosisInput?.description) {
      throw new BadRequestException('code and description are required');
    }
    const existingDiagnosisWithCode = await this.diagnosisRepository.findOne({
      where: { code: diagnosisInput.code },
    });
    if (existingDiagnosisWithCode)
      throw new ConflictException(`Diagnosis code '${diagnosisInput.code}' exists`);
    return this.diagnosisRepository.save(
      this.diagnosisRepository.create(diagnosisInput),
    );
  }

  async updateDiagnosisById(
    diagnosisId: string,
    diagnosisUpdates: Partial<DiagnosisInput>,
  ): Promise<Diagnosis> {
    const diagnosis = await this.getDiagnosisById(diagnosisId);
    Object.assign(diagnosis, diagnosisUpdates);
    return this.diagnosisRepository.save(diagnosis);
  }

  async deleteDiagnosisById(diagnosisId: string): Promise<void> {
    const result = await this.diagnosisRepository.delete(diagnosisId);
    if (!result.affected)
      throw new NotFoundException(`Diagnosis ${diagnosisId} not found`);
  }
}
