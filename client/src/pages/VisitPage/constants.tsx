export type ToastState = { severity: 'success' | 'error' | 'warning'; message: string } | null;
export type DiagnosisItem = { code: string; description: string };
export type MedicineItem = { name: string; dosage: string; frequency: string; duration: string; instructions?: string };
export type PatientInfo = { name: string; phone?: string; idNumber?: string; dob?: string; hmo?: string; bloodType?: string };

export const RTL_TEXT_DIRECTION = { dir: 'rtl' as const, style: { textAlign: 'right' as const } };
