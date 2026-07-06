import type { ReactElement } from "react";
import type { RoleName } from "../../auth/types";

export interface ITourStep {
  icon: ReactElement;
  title: string;
  description: string;
  tip?: string;
}

export interface IRoleGuide {
  color: string;
  accent: string;
  steps: ITourStep[];
}

export type TGuideRole = "patient" | "doctor" | "secretary";

export interface ISystemInfoModalProps {
  role?: RoleName;
  onClose: () => void;
}
