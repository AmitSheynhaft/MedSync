import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine } from './entities/medicineEntity';

export interface MedicineInput {
  name: string;
}

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
  ) {}

  getAllMedicines(searchQuery?: string): Promise<Medicine[]> {
    const medicinesQueryBuilder = this.medicineRepository.createQueryBuilder('m');
    if (searchQuery?.trim()) {
      medicinesQueryBuilder.where('m.name ILIKE :q', {
        q: `%${searchQuery.trim()}%`,
      });
    }
    return medicinesQueryBuilder.orderBy('m.name', 'ASC').getMany();
  }

  async getMedicineById(medicineId: string): Promise<Medicine> {
    const medicine = await this.medicineRepository.findOne({
      where: { id: medicineId },
    });
    if (!medicine) throw new NotFoundException(`Medicine ${medicineId} not found`);
    return medicine;
  }

  async getOrCreateMedicineByName(medicineName: string): Promise<Medicine> {
    const existingMedicine = await this.medicineRepository.findOne({
      where: { name: medicineName },
    });
    if (existingMedicine) return existingMedicine;
    return this.medicineRepository.save(
      this.medicineRepository.create({ name: medicineName }),
    );
  }

  async createMedicine(medicineInput: MedicineInput): Promise<Medicine> {
    if (!medicineInput?.name) throw new BadRequestException('name is required');
    const existingMedicine = await this.medicineRepository.findOne({
      where: { name: medicineInput.name },
    });
    if (existingMedicine)
      throw new ConflictException(`Medicine '${medicineInput.name}' exists`);
    return this.medicineRepository.save(
      this.medicineRepository.create(medicineInput),
    );
  }

  async updateMedicineById(
    medicineId: string,
    medicineUpdates: Partial<MedicineInput>,
  ): Promise<Medicine> {
    const medicine = await this.getMedicineById(medicineId);
    if (medicineUpdates.name !== undefined) medicine.name = medicineUpdates.name;
    return this.medicineRepository.save(medicine);
  }

  async deleteMedicineById(medicineId: string): Promise<void> {
    const deleteResult = await this.medicineRepository.delete(medicineId);
    if (!deleteResult.affected)
      throw new NotFoundException(`Medicine ${medicineId} not found`);
  }
}
