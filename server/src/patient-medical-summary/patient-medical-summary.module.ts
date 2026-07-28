import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientMedicalSummaryService } from './patient-medical-summary.service';
import { PatientMedicalSummary } from './entities/patientMedicalSummaryEntity';
import { Patient } from '../patients/entities/patientEntity';
import { VisitSummary } from '../visits/entities/visitSummaryEntity';
import { DocumentSummary } from '../documents/entities/documentSummaryEntity';
import { PatientClinicalAlert } from '../clinical-alerts/entities/patientClinicalAlertEntity';
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
