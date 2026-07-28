import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caregiver } from './entities/caregiverEntity';
import { CaregiverInput } from './types/caregiver.types';

@Injectable()
export class CaregiversService {
  constructor(
    @InjectRepository(Caregiver) private readonly caregiverRepo: Repository<Caregiver>,
  ) {}

  getAllCaregivers(): Promise<Caregiver[]> {
    return this.caregiverRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCaregiverByUserId(userId: string): Promise<Caregiver> {
    const caregiver = await this.caregiverRepo.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!caregiver)
      throw new NotFoundException(`Caregiver for user ${userId} not found`);
    return caregiver;
  }

  async createCaregiver(input: CaregiverInput): Promise<Caregiver> {
    if (!input?.userId || !input?.licenseNumber || !input?.specialization) {
      throw new BadRequestException(
        'userId, licenseNumber and specialization are required',
      );
    }
    const existingCaregiverForUser = await this.caregiverRepo.findOne({
      where: { userId: input.userId },
    });
    if (existingCaregiverForUser)
      throw new ConflictException('Caregiver already exists for this user');

    const existingCaregiverWithLicense = await this.caregiverRepo.findOne({
      where: { licenseNumber: input.licenseNumber },
    });
    if (existingCaregiverWithLicense)
      throw new ConflictException('License number already in use');

    return this.caregiverRepo.save(this.caregiverRepo.create(input));
  }

  async updateCaregiverByUserId(
    userId: string,
    caregiverUpdates: Partial<CaregiverInput>,
  ): Promise<Caregiver> {
    const caregiver = await this.getCaregiverByUserId(userId);
    if (caregiverUpdates.licenseNumber !== null && caregiverUpdates.licenseNumber !== undefined)
      caregiver.licenseNumber = caregiverUpdates.licenseNumber;
    if (caregiverUpdates.specialization !== null && caregiverUpdates.specialization !== undefined)
      caregiver.specialization = caregiverUpdates.specialization;
    if (caregiverUpdates.clinicName !== null && caregiverUpdates.clinicName !== undefined)
      caregiver.clinicName = caregiverUpdates.clinicName;
    return this.caregiverRepo.save(caregiver);
  }

  async deleteCaregiverById(caregiverId: string): Promise<void> {
    const result = await this.caregiverRepo.delete(caregiverId);
    if (!result.affected)
      throw new NotFoundException(`Caregiver ${caregiverId} not found`);
  }
}
