import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientMedicalSummaryService } from './patient-medical-summary.service';
import { PatientMedicalSummary } from '../entities/patientMedicalSummary/patientMedicalSummaryEntity';
import { Patient } from '../entities/patient/patientEntity';
import { VisitSummary } from '../entities/visitSummary/visitSummaryEntity';
import { DocumentSummary } from '../entities/documentSummary/documentSummaryEntity';
import { PatientClinicalAlert } from '../entities/patientClinicalAlert/patientClinicalAlertEntity';
import { ClinicalAlertsModule } from '../clinical-alerts/clinical-alerts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientMedicalSummary,
      Patient,
      VisitSummary,
      DocumentSummary,
      PatientClinicalAlert,
    ]),
    ClinicalAlertsModule,
  ],
  providers: [PatientMedicalSummaryService],
  exports: [PatientMedicalSummaryService],
})
export class PatientMedicalSummaryModule {}
