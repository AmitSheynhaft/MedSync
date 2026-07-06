import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { Slot } from '../entities/slot/slotEntity';
import { SlotStatus } from '../entities/slot/slotStatus';
import { Caregiver } from '../entities/caregiver/caregiverEntity';
import { Secretary } from '../entities/secretary/secretaryEntity';
import { User } from '../entities/user/userEntity';
import { PatientClinic } from '../entities/patientClinic/patientClinicEntity';
import {
  ROLE_DOCTOR,
  ROLE_PATIENT,
  ROLE_SECRETARY,
} from '../common/constants/roles';
import { PatientsService } from '../patients/patients.service';
import { calcAge } from '../common/age.util';
import {
  BookSlotInput,
  BookablePatientDto,
  PaginatedDto,
  SlotAvailabilityDto,
  SlotDto,
  TherapistOptionDto,
} from './slot.dto';
import {
  assertSlotNotInPast,
  assertValidSlotTime,
  buildSlotTime,
  formatDatePart,
  formatTimePart,
  generateDailySlotTimes,
  getDayBounds,
} from './slot-times.util';

const SLOT_DETAIL_RELATIONS = [
  'patient',
  'patient.user',
  'caregiver',
  'caregiver.user',
];

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot) private readonly repo: Repository<Slot>,
    @InjectRepository(Caregiver)
    private readonly caregivers: Repository<Caregiver>,
    @InjectRepository(Secretary)
    private readonly secretaries: Repository<Secretary>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly patientsService: PatientsService,
    private readonly dataSource: DataSource,
  ) {}

  private async getSecretaryClinicId(userId: string): Promise<string> {
    const secretary = await this.secretaries.findOne({ where: { userId } });
    if (!secretary) {
      throw new ForbiddenException('No secretary profile for this user');
    }
    if (!secretary.clinicId) {
      throw new ForbiddenException('Secretary is not assigned to a clinic');
    }
    return secretary.clinicId;
  }

  async book(input: BookSlotInput, secretaryUserId: string): Promise<SlotDto> {
    if (!input?.caregiverId || !input?.patientUserId) {
      throw new BadRequestException(
        'caregiverId and patientUserId are required',
      );
    }

    const secretaryClinicId = await this.getSecretaryClinicId(secretaryUserId);

    const slotTime = buildSlotTime(input.date, input.time);
    assertValidSlotTime(slotTime);
    assertSlotNotInPast(slotTime);

    const caregiver = await this.caregivers.findOne({
      where: { id: input.caregiverId },
      relations: ['user'],
    });
    if (!caregiver) {
      throw new NotFoundException('Therapist not found');
    }
    if (caregiver.clinicId !== secretaryClinicId) {
      throw new ForbiddenException(
        'המטפל אינו שייך למרפאה שלך',
      );
    }

    const patientUser = await this.users.findOne({
      where: { id: input.patientUserId },
    });
    if (!patientUser) {
      throw new NotFoundException('Patient user not found');
    }
    if (patientUser.id === caregiver.userId) {
      throw new BadRequestException(
        'A therapist cannot be scheduled as their own patient',
      );
    }
    if (patientUser.id === secretaryUserId) {
      throw new BadRequestException(
        'לא ניתן לקבוע תור עבור עצמך',
      );
    }

    await this.assertUserBelongsToClinic(patientUser.id, secretaryClinicId);

    const slot = await this.dataSource.transaction(async (manager) => {
      const patient = await this.patientsService.ensureForUser(
        patientUser.id,
        manager,
      );

      const clinicRepo = manager.getRepository(PatientClinic);
      const membership = await clinicRepo.findOne({
        where: { patientId: patient.id, clinicId: secretaryClinicId },
      });
      if (!membership) {
        await clinicRepo.save(
          clinicRepo.create({
            patientId: patient.id,
            clinicId: secretaryClinicId,
          }),
        );
      }

      const slotRepo = manager.getRepository(Slot);
      const clashing = await slotRepo.findOne({
        where: {
          caregiverId: caregiver.id,
          slotTime,
          status: SlotStatus.SCHEDULED,
        },
      });
      if (clashing) {
        throw new ConflictException('This slot is already booked');
      }

      try {
        return await slotRepo.save(
          slotRepo.create({
            patientId: patient.id,
            caregiverId: caregiver.id,
            slotTime,
            hasReferral: !!input.hasReferral,
            status: SlotStatus.SCHEDULED,
          }),
        );
      } catch (err) {
        if (err instanceof QueryFailedError) {
          throw new ConflictException('This slot is already booked');
        }
        throw err;
      }
    });

    const created = await this.repo.findOne({
      where: { id: slot.id },
      relations: SLOT_DETAIL_RELATIONS,
    });
    return this.toDto(created ?? slot);
  }

  private async assertUserBelongsToClinic(
    userId: string,
    clinicId: string,
  ): Promise<void> {
    const [caregiver, secretary, patientMembership] = await Promise.all([
      this.caregivers.findOne({ where: { userId, clinicId } }),
      this.secretaries.findOne({ where: { userId, clinicId } }),
      this.dataSource
        .getRepository(PatientClinic)
        .createQueryBuilder('pc')
        .innerJoin('pc.patient', 'patient')
        .where('patient.userId = :userId', { userId })
        .andWhere('pc.clinicId = :clinicId', { clinicId })
        .getOne(),
    ]);
    if (!caregiver && !secretary && !patientMembership) {
      throw new ForbiddenException('המשתמש אינו שייך למרפאה שלך');
    }
  }

  async getAvailability(
    caregiverId: string,
    date: string,
  ): Promise<SlotAvailabilityDto> {
    if (!caregiverId) {
      throw new BadRequestException('caregiverId is required');
    }
    const { start, end } = getDayBounds(date);
    const booked = await this.repo.find({
      where: {
        caregiverId,
        slotTime: Between(start, end),
        status: SlotStatus.SCHEDULED,
      },
    });
    const takenTimes = new Set(booked.map((s) => formatTimePart(s.slotTime)));

    return {
      date,
      caregiverId,
      slots: generateDailySlotTimes().map((time) => ({
        time,
        available: !takenTimes.has(time),
      })),
    };
  }

  async listTherapists(
    secretaryUserId: string,
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedDto<TherapistOptionDto>> {
    const clinicId = await this.getSecretaryClinicId(secretaryUserId);
    const { pageNumber, take, skip } = resolvePaging(page, limit);

    const qb = this.caregivers
      .createQueryBuilder('caregiver')
      .leftJoinAndSelect('caregiver.user', 'user')
      .where('caregiver.clinicId = :clinicId', { clinicId })
      .orderBy('user.fullName', 'ASC')
      .skip(skip)
      .take(take);

    const term = search?.trim();
    if (term) {
      qb.andWhere(
        '(user.fullName ILIKE :term OR caregiver.specialization ILIKE :term)',
        { term: `%${term}%` },
      );
    }

    const [caregivers, total] = await qb.getManyAndCount();
    const items = caregivers.map((c) => ({
      caregiverId: c.id,
      fullName: c.user?.fullName ?? '',
      specialization: c.specialization ?? '',
    }));
    return { items, total, page: pageNumber, hasMore: skip + items.length < total };
  }

  async listBookablePatients(
    secretaryUserId: string,
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedDto<BookablePatientDto>> {
    const clinicId = await this.getSecretaryClinicId(secretaryUserId);
    const { pageNumber, take, skip } = resolvePaging(page, limit);

    const qb = this.users
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.patient', 'patient')
      .leftJoin('user.caregiver', 'caregiver')
      .leftJoin('user.secretary', 'secretary')
      .leftJoin('patient.patientClinics', 'patientClinic', 'patientClinic.clinicId = :clinicId', { clinicId })
      .where('role.name IN (:...roles)', {
        roles: [ROLE_PATIENT, ROLE_DOCTOR, ROLE_SECRETARY],
      })
      .andWhere('user.id != :secretaryUserId', { secretaryUserId })
      .andWhere(
        '((role.name = :patientRole AND patientClinic.clinicId = :clinicId)' +
          ' OR (role.name = :doctorRole AND caregiver.clinicId = :clinicId)' +
          ' OR (role.name = :secretaryRole AND secretary.clinicId = :clinicId))',
        {
          clinicId,
          patientRole: ROLE_PATIENT,
          doctorRole: ROLE_DOCTOR,
          secretaryRole: ROLE_SECRETARY,
        },
      )
      .orderBy('user.fullName', 'ASC')
      .skip(skip)
      .take(take);

    const term = search?.trim();
    if (term) {
      qb.andWhere('(user.fullName ILIKE :term OR user.email ILIKE :term)', {
        term: `%${term}%`,
      });
    }

    const [users, total] = await qb.getManyAndCount();
    const items = users.map((user) => ({
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role?.name ?? '',
      patientId: user.patient?.id,
    }));
    return { items, total, page: pageNumber, hasMore: skip + items.length < total };
  }

  async listSecretaryUpcoming(secretaryUserId: string): Promise<SlotDto[]> {
    const clinicId = await this.getSecretaryClinicId(secretaryUserId);
    const slots = await this.repo
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('slot.caregiver', 'caregiver')
      .leftJoinAndSelect('caregiver.user', 'caregiverUser')
      .where('caregiver.clinicId = :clinicId', { clinicId })
      .andWhere('slot.status = :status', { status: SlotStatus.SCHEDULED })
      .andWhere('slot.slotTime >= :now', { now: new Date() })
      .orderBy('slot.slotTime', 'ASC')
      .getMany();
    return slots.map((slot) => this.toDto(slot));
  }

  async listSecretaryPast(secretaryUserId: string): Promise<SlotDto[]> {
    const clinicId = await this.getSecretaryClinicId(secretaryUserId);
    const now = new Date();
    const slots = await this.repo
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('slot.caregiver', 'caregiver')
      .leftJoinAndSelect('caregiver.user', 'caregiverUser')
      .where('caregiver.clinicId = :clinicId', { clinicId })
      .andWhere(
        '(slot.status = :cancelled OR (slot.status = :scheduled AND slot.slotTime < :now))',
        {
          cancelled: SlotStatus.CANCELLED,
          scheduled: SlotStatus.SCHEDULED,
          now,
        },
      )
      .orderBy('slot.slotTime', 'DESC')
      .getMany();
    return slots.map((slot) => this.toDto(slot));
  }

  async removeAsSecretary(id: string, secretaryUserId: string): Promise<void> {
    const clinicId = await this.getSecretaryClinicId(secretaryUserId);
    const slot = await this.repo.findOne({
      where: { id },
      relations: ['caregiver'],
    });
    if (!slot) throw new NotFoundException(`Slot ${id} not found`);
    if (slot.caregiver?.clinicId !== clinicId) {
      throw new ForbiddenException('התור אינו שייך למרפאה שלך');
    }
    if (slot.status === SlotStatus.CANCELLED) return;
    slot.status = SlotStatus.CANCELLED;
    await this.repo.save(slot);
  }

  async getCaregiverSlotsByDate(
    userId: string,
    date: string,
  ): Promise<SlotDto[]> {
    const caregiver = await this.caregivers.findOne({ where: { userId } });
    if (!caregiver) {
      throw new ForbiddenException('No therapist profile for this user');
    }
    const { start, end } = getDayBounds(date);
    const slots = await this.repo.find({
      where: {
        caregiverId: caregiver.id,
        slotTime: Between(start, end),
        status: SlotStatus.SCHEDULED,
      },
      relations: SLOT_DETAIL_RELATIONS,
      order: { slotTime: 'ASC' },
    });
    return slots.map((slot) => this.toDto(slot));
  }

  async getPatientUpcoming(userId: string): Promise<SlotDto[]> {
    return this.getPatientSlots(userId, 'upcoming');
  }

  async getPatientPast(userId: string): Promise<SlotDto[]> {
    return this.getPatientSlots(userId, 'past');
  }

  async getPatientCancelled(userId: string): Promise<SlotDto[]> {
    return this.getPatientSlots(userId, 'cancelled');
  }

  private async getPatientSlots(
    userId: string,
    scope: 'upcoming' | 'past' | 'cancelled',
  ): Promise<SlotDto[]> {
    const patient = await this.patientsService
      .ensureForUser(userId)
      .catch(() => null);
    if (!patient) return [];

    const now = new Date();
    const qb = this.repo
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('slot.caregiver', 'caregiver')
      .leftJoinAndSelect('caregiver.user', 'caregiverUser')
      .where('slot.patientId = :patientId', { patientId: patient.id });

    if (scope === 'upcoming') {
      qb.andWhere('slot.status = :status', { status: SlotStatus.SCHEDULED })
        .andWhere('slot.slotTime >= :now', { now })
        .orderBy('slot.slotTime', 'ASC');
    } else if (scope === 'past') {
      qb.andWhere('slot.status = :status', { status: SlotStatus.SCHEDULED })
        .andWhere('slot.slotTime < :now', { now })
        .orderBy('slot.slotTime', 'DESC');
    } else {
      qb.andWhere('slot.status = :status', { status: SlotStatus.CANCELLED })
        .orderBy('slot.slotTime', 'DESC');
    }

    const slots = await qb.getMany();
    return slots.map((slot) => this.toDto(slot));
  }

  private toDto(slot: Slot): SlotDto {
    const slotTime = new Date(slot.slotTime);
    return {
      id: slot.id,
      date: formatDatePart(slotTime),
      time: formatTimePart(slotTime),
      slotTime: slotTime.toISOString(),
      status: slot.status ?? SlotStatus.SCHEDULED,
      patient: {
        patientId: slot.patientId,
        userId: slot.patient?.userId ?? '',
        fullName: slot.patient?.user?.fullName ?? '',
        idNumber: slot.patient?.idNumber,
        gender: slot.patient?.user?.gender,
        age: calcAge(slot.patient?.user?.birthDate),
      },
      therapist: {
        caregiverId: slot.caregiverId,
        fullName: slot.caregiver?.user?.fullName ?? '',
        specialization: slot.caregiver?.specialization ?? '',
      },
    };
  }
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function resolvePaging(
  page?: number,
  limit?: number,
): { pageNumber: number; take: number; skip: number } {
  const pageNumber = Number.isFinite(page) && (page as number) > 0 ? Math.floor(page as number) : 1;
  const rawLimit = Number.isFinite(limit) && (limit as number) > 0 ? Math.floor(limit as number) : DEFAULT_PAGE_SIZE;
  const take = Math.min(rawLimit, MAX_PAGE_SIZE);
  return { pageNumber, take, skip: (pageNumber - 1) * take };
}
