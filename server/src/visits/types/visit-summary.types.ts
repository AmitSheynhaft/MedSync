export interface VisitVitals {
  bloodPressure?: string;
  pulse?: string;
  bodyTemp?: string;
  weight?: string;
  height?: string;
  oxygenSat?: string;
}

export interface ExtractedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface ExtractedDiagnosis {
  description: string;
  note?: string;
}

export interface VisitSummaryObject {
  patientComplaints: string;
  diagnosis: string;
  doctorsRecommendations: string;
  vitals?: VisitVitals;
  medicines?: ExtractedMedicine[];
  diagnoses?: ExtractedDiagnosis[];
}
