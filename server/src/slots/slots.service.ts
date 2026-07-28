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
  ILike,
  LessThan,
  MoreThanOrEqual,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { Slot } from './entities/slotEntity';
import { SlotStatus } from './entities/slotStatus';
import { Caregiver } from '../caregivers/entities/caregiverEntity';
import { Secretary } from '../users/entities/secretaryEntity';
import { User } from '../users/entities/userEntity';
import { PatientClinic } from '../patients/entities/patientClinicEntity';
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
    @InjectRepository(Slot) private readonly slotRepository: Repository<Slot>,
    @InjectRepository(Caregiver)
    private readonly caregiverRepository: Repository<Caregiver>,
    @InjectRepository(Secretary)
    private readonly secretaryRepository: Repository<Secretary>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly patientsService: PatientsService,
    private readonly dataSource: DataSource,
  ) {}

  private async getClinicIdForSecretaryUser(userId: string): Promise<string> {
    const secretary = await this.secretaryRepository.findOne({
      where: { userId },
    });
    if (!secretary) {
      throw new ForbiddenException('No secretary profile for this user');
    }
    if (!secretary.clinicId) {
      throw new ForbiddenException('Secretary is not assigned to a clinic');
    }
    return secretary.clinicId;
  }

  async bookSlotForSecretary(
    input: BookSlotInput,
    secretaryUserId: string,
  ): Promise<SlotDto> {
    if (!input?.caregiverId || !input?.patientUserId) {
      throw new BadRequestException(
        'caregiverId and patientUserId are required',
      );
    }

    const secretaryClinicId = await this.getClinicIdForSecretaryUser(
      secretaryUserId,
    );

    const slotTime = buildSlotTime(input.date, input.time);
    assertValidSlotTime(slotTime);
    assertSlotNotInPast(slotTime);

    const caregiver = await this.caregiverRepository.findOne({
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

    const patientUser = await this.userRepository.findOne({
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

    await this.assertUserBelongsToSecretaryClinic(
      patientUser.id,
      secretaryClinicId,
    );

    const slot = await this.dataSource.transaction(async (manager) => {
      const patient = await this.patientsService.ensurePatientProfileForUser(
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
            // Audit only — the secretary is the actor, not the owner.
            createdByUserId: secretaryUserId,
          }),
        );
      } catch (err) {
        if (err instanceof QueryFailedError) {
          throw new ConflictException('This slot is already booked');
        }
        throw err;
      }
    });

    const created = await this.slotRepository.findOne({
      where: { id: slot.id },
      relations: SLOT_DETAIL_RELATIONS,
    });
    return this.mapSlotEntityToDto(created ?? slot);
  }

  private async assertUserBelongsToSecretaryClinic(
    userId: string,
    clinicId: string,
  ): Promise<void> {
    const [caregiver, secretary, patientMembership] = await Promise.all([
      this.caregiverRepository.findOne({ where: { userId, clinicId } }),
      this.secretaryRepository.findOne({ where: { userId, clinicId } }),
      this.dataSource.getRepository(PatientClinic).findOne({
        where: { clinicId, patient: { userId } },
      }),
    ]);
    if (!caregiver && !secretary && !patientMembership) {
      throw new ForbiddenException('המשתמש אינו שייך למרפאה שלך');
    }
  }

  async getCaregiverAvailabilityByDate(
    caregiverId: string,
    date: string,
  ): Promise<SlotAvailabilityDto> {
    if (!caregiverId) {
      throw new BadRequestException('caregiverId is required');
    }
    const { start, end } = getDayBounds(date);
    const booked = await this.slotRepository.find({
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

  async getTherapistOptionsForSecretary(
    secretaryUserId: string,
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedDto<TherapistOptionDto>> {
    const clinicId = await this.getClinicIdForSecretaryUser(secretaryUserId);
    const { pageNumber, take, skip } = resolvePaging(page, limit);

    const term = search?.trim();
    const like = term ? ILike(`%${term}%`) : undefined;
    const where = like
      ? [
          { clinicId, user: { fullName: like } },
          { clinicId, specialization: like },
        ]
      : { clinicId };

    const [caregivers, total] = await this.caregiverRepository.findAndCount({
      where,
      relations: ['user'],
      order: { user: { fullName: 'ASC' } },
      skip,
      take,
    });
    const items = caregivers.map((c) => ({
      caregiverId: c.id,
      fullName: c.user?.fullName ?? '',
      specialization: c.specialization ?? '',
    }));
    return { items, total, page: pageNumber, hasMore: skip + items.length < total };
  }

  async getBookablePatientsForSecretary(
    secretaryUserId: string,
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedDto<BookablePatientDto>> {
    const clinicId = await this.getClinicIdForSecretaryUser(secretaryUserId);
    const { pageNumber, take, skip } = resolvePaging(page, limit);

    const term = search?.trim();
    const like = term ? ILike(`%${term}%`) : undefined;
    const searchBranches = like
      ? [{ fullName: like }, { email: like }]
      : [{}];

    const where = searchBranches.map((searchBranch) => ({
      ...searchBranch,
      id: Not(secretaryUserId),
      role: { name: ROLE_PATIENT },
      patient: { patientClinics: { clinicId } },
    }));

    const [users, total] = await this.userRepository.findAndCount({
      where,
      relations: ['role', 'patient', 'patient.patientClinics'],
      order: { fullName: 'ASC' },
      skip,
      take,
    });
    const items = users.map((user) => ({
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role?.name ?? '',
      patientId: user.patient?.id,
    }));
    return { items, total, page: pageNumber, hasMore: skip + items.length < total };
  }

  async getUpcomingSlotsForSecretary(secretaryUserId: string): Promise<SlotDto[]> {
    const clinicId = await this.getClinicIdForSecretaryUser(secretaryUserId);
    const slots = await this.slotRepository.find({
      where: {
        caregiver: { clinicId },
        status: SlotStatus.SCHEDULED,
        slotTime: MoreThanOrEqual(new Date()),
      },
      relations: SLOT_DETAIL_RELATIONS,
      order: { slotTime: 'ASC' },
    });
    return slots.map((slot) => this.mapSlotEntityToDto(slot));
  }

  async getPastSlotsForSecretary(secretaryUserId: string): Promise<SlotDto[]> {
    const clinicId = await this.getClinicIdForSecretaryUser(secretaryUserId);
    const now = new Date();
    const slots = await this.slotRepository.find({
      where: [
        { caregiver: { clinicId }, status: SlotStatus.CANCELLED },
        {
          caregiver: { clinicId },
          status: SlotStatus.SCHEDULED,
          slotTime: LessThan(now),
        },
      ],
      relations: SLOT_DETAIL_RELATIONS,
      order: { slotTime: 'DESC' },
    });
    return slots.map((slot) => this.mapSlotEntityToDto(slot));
  }

  async cancelSlotAsSecretary(
    slotId: string,
    secretaryUserId: string,
  ): Promise<void> {
    const clinicId = await this.getClinicIdForSecretaryUser(secretaryUserId);
    const slot = await this.slotRepository.findOne({
      where: { id: slotId },
      relations: ['caregiver'],
    });
    if (!slot) throw new NotFoundException(`Slot ${slotId} not found`);
    if (slot.caregiver?.clinicId !== clinicId) {
      throw new ForbiddenException('התור אינו שייך למרפאה שלך');
    }
    if (slot.status === SlotStatus.CANCELLED) return;
    slot.status = SlotStatus.CANCELLED;
    slot.cancelledByUserId = secretaryUserId;
    await this.slotRepository.save(slot);
  }

  async cancelSlotAsPatient(slotId: string, patientUserId: string): Promise<void> {
    const slot = await this.slotRepository.findOne({
      where: { id: slotId },
      relations: ['patient'],
    });
    if (!slot) throw new NotFoundException(`Slot ${slotId} not found`);
    if (slot.patient?.userId !== patientUserId) {
      throw new ForbiddenException('התור אינו שייך לך');
    }
    if (slot.status === SlotStatus.CANCELLED) return;
    if (slot.slotTime.getTime() < Date.now()) {
      throw new BadRequestException('לא ניתן לבטל תור שכבר עבר');
    }
    slot.status = SlotStatus.CANCELLED;
    slot.cancelledByUserId = patientUserId;
    await this.slotRepository.save(slot);
  }

  async getScheduledCaregiverSlotsByDate(
    userId: string,
    date: string,
  ): Promise<SlotDto[]> {
    const caregiver = await this.caregiverRepository.findOne({
      where: { userId },
    });
    if (!caregiver) {
      throw new ForbiddenException('No therapist profile for this user');
    }
    const { start, end } = getDayBounds(date);
    const slots = await this.slotRepository.find({
      where: {
        caregiverId: caregiver.id,
        slotTime: Between(start, end),
        status: SlotStatus.SCHEDULED,
      },
      relations: [...SLOT_DETAIL_RELATIONS, 'visit'],
      order: { slotTime: 'ASC' },
    });
    // Hide slots that already have a visit so a doctor can't open a second one.
    return slots
      .filter((slot) => !slot.visit)
      .map((slot) => this.mapSlotEntityToDto(slot));
  }

  async getUpcomingSlotsForPatient(userId: string): Promise<SlotDto[]> {
    return this.getPatientSlotsByScope(userId, 'upcoming');
  }

  async getPastSlotsForPatient(userId: string): Promise<SlotDto[]> {
    return this.getPatientSlotsByScope(userId, 'past');
  }

  async getCancelledSlotsForPatient(userId: string): Promise<SlotDto[]> {
    return this.getPatientSlotsByScope(userId, 'cancelled');
  }

  private async getPatientSlotsByScope(
    userId: string,
    scope: 'upcoming' | 'past' | 'cancelled',
  ): Promise<SlotDto[]> {
    const patient = await this.patientsService
      .ensurePatientProfileForUser(userId)
      .catch(() => null);
    if (!patient) return [];

    const now = new Date();
    const scopeWhere =
      scope === 'upcoming'
        ? { status: SlotStatus.SCHEDULED, slotTime: MoreThanOrEqual(now) }
        : scope === 'past'
        ? { status: SlotStatus.SCHEDULED, slotTime: LessThan(now) }
        : { status: SlotStatus.CANCELLED };

    const slots = await this.slotRepository.find({
      where: { patientId: patient.id, ...scopeWhere },
      relations: SLOT_DETAIL_RELATIONS,
      order: { slotTime: scope === 'upcoming' ? 'ASC' : 'DESC' },
    });
    return slots.map((slot) => this.mapSlotEntityToDto(slot));
  }

  private mapSlotEntityToDto(slot: Slot): SlotDto {
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
      audit: {
        createdByUserId: slot.createdByUserId,
        cancelledByUserId: slot.cancelledByUserId,
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
