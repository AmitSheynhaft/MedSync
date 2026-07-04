import { IRole } from '../../entities';

export const ROLE_DOCTOR = 'doctor';
export const ROLE_PATIENT = 'patient';

export const ALL_ROLES: IRole['name'][] = [ROLE_DOCTOR, ROLE_PATIENT];

export type TRoleName = (typeof ALL_ROLES)[number];
