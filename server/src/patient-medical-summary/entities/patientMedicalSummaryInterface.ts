export interface IPatientMedicalSummary {
  id: string;
  patientId: string;
  summaryText: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
