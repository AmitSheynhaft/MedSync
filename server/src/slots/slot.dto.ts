export type SlotStatusDto = 'scheduled' | 'cancelled';

export interface BookSlotInput {
  caregiverId: string;
  patientUserId: string;
  date: string;
  time: string;
  hasReferral?: boolean;
}

export interface SlotPatientDto {
  patientId: string;
  userId: string;
  fullName: string;
  idNumber?: string;
  gender?: string;
  age?: number;
}

export interface SlotTherapistDto {
  caregiverId: string;
  fullName: string;
  specialization: string;
}

export interface SlotDto {
  id: string;
  date: string;
  time: string;
  slotTime: string;
  status: SlotStatusDto;
  patient: SlotPatientDto;
  therapist: SlotTherapistDto;
}

export interface SlotTimeDto {
  time: string;
  available: boolean;
}

export interface SlotAvailabilityDto {
  date: string;
  caregiverId: string;
  slots: SlotTimeDto[];
}

export interface TherapistOptionDto {
  caregiverId: string;
  fullName: string;
  specialization: string;
}

export interface BookablePatientDto {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  patientId?: string;
}

export interface PaginatedDto<T> {
  items: T[];
  total: number;
  page: number;
  hasMore: boolean;
}
