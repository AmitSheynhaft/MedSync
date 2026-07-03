export enum SummaryStatus {
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum DocumentType {
  LAB_RESULT = 'LAB_RESULT',
  REFERRAL = 'REFERRAL',
  DISCHARGE_SUMMARY = 'DISCHARGE_SUMMARY',
  IMAGING = 'IMAGING',
  PRESCRIPTION = 'PRESCRIPTION',
  OTHER = 'OTHER',
}

export enum RecordingStatus {
  PENDING = 'PENDING',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  TRANSCRIBED = 'TRANSCRIBED',
  AI_PROCESSING = 'AI_PROCESSING',
  AI_SUCCESS = 'AI_SUCCESS',
  AI_PARTIAL_SUCCESS = 'AI_PARTIAL_SUCCESS',
  FAILED = 'FAILED',
}

export enum VisitSummaryType {
  RECORDING = 'RECORDING',
  MANUAL_INPUT = 'MANUAL_INPUT',
}

export enum VisitType {
  REGULAR = 'REGULAR',
  EMERGENCY = 'EMERGENCY',
  FOLLOW_UP = 'FOLLOW_UP',
}

export enum ClinicalAlertCategory {
  ALLERGY = 'ALLERGY',
  LIFE_THREATENING = 'LIFE_THREATENING',
  CHRONIC = 'CHRONIC',
}

export enum ClinicalAlertSeverity {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum ClinicalAlertSource {
  AI = 'AI',
  MANUAL = 'MANUAL',
}
