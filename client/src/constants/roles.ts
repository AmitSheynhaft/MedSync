export enum Role {
  Doctor = "doctor",
  Patient = "patient",
}

export const ALL_ROLES = Object.values(Role);

export type TRoleName = `${Role}`;
