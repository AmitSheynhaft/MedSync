import type { ReactElement } from "react";
import type { RoleName } from "../../api/auth";

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

export type TGuideRole = "patient" | "doctor";

export interface ISystemInfoModalProps {
  role?: RoleName;
  onClose: () => void;
}
