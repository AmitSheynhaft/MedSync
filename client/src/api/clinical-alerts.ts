import { apiDelete, apiGet, apiPost } from './client';
import type {
  ClinicalAlert,
  ClinicalAlertCategory,
  ClinicalAlertSeverity,
} from './patients';

export type {
  ClinicalAlert,
  ClinicalAlertCategory,
  ClinicalAlertSeverity,
} from './patients';

export function getClinicalAlerts(patientId: string): Promise<ClinicalAlert[]> {
  return apiGet<ClinicalAlert[]>(
    `/api/patients/${encodeURIComponent(patientId)}/clinical-alerts`,
  );
}

export function refreshClinicalAlerts(
  patientId: string,
): Promise<ClinicalAlert[]> {
  return apiPost<ClinicalAlert[]>(
    `/api/patients/${encodeURIComponent(patientId)}/clinical-alerts/regenerate`,
    {},
  );
}

export function createManualAlert(
  patientId: string,
  label: string,
  severity: ClinicalAlertSeverity,
  category: ClinicalAlertCategory,
): Promise<ClinicalAlert> {
  return apiPost<ClinicalAlert>(
    `/api/patients/${encodeURIComponent(patientId)}/clinical-alerts`,
    { label, severity, category },
  );
}

export function deleteManualAlert(
  patientId: string,
  alertId: string,
): Promise<void> {
  return apiDelete<void>(
    `/api/patients/${encodeURIComponent(patientId)}/clinical-alerts/${encodeURIComponent(alertId)}`,
  );
}
