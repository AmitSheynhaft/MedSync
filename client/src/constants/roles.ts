export enum Role {
  Admin = "admin",
  Doctor = "doctor",
  Patient = "patient",
  Secretary = "secretary",
}

export const ALL_ROLES = Object.values(Role);

export type TRoleName = `${Role}`;
