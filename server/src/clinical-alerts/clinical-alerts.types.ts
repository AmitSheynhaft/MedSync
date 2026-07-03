import {
  ClinicalAlertCategory,
  ClinicalAlertSeverity,
  ClinicalAlertSource,
} from '../entities/enums';

export interface ClinicalAlertDto {
  id: string;
  category: ClinicalAlertCategory;
  severity: ClinicalAlertSeverity;
  label: string;
  source: ClinicalAlertSource;
}

export interface CreateManualAlertDto {
  label: string;
  severity: ClinicalAlertSeverity;
  category?: ClinicalAlertCategory;
}

/** @deprecated Use CreateManualAlertDto */
export type CreateManualAllergyDto = CreateManualAlertDto;

export interface BulkRegenerateResult {
  total: number;
  succeeded: number;
  failed: number;
}
