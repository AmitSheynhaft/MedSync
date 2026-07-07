import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalAlertsController } from './clinical-alerts.controller';
import { ClinicalAlertsService } from './clinical-alerts.service';
import { PatientClinicalAlert } from '../entities/patientClinicalAlert/patientClinicalAlertEntity';
import { Patient } from '../entities/patient/patientEntity';
import { PatientMedicalSummary } from '../entities/patientMedicalSummary/patientMedicalSummaryEntity';
import { VisitSummary } from '../entities/visitSummary/visitSummaryEntity';
import { DocumentSummary } from '../entities/documentSummary/documentSummaryEntity';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientClinicalAlert,
      Patient,
      PatientMedicalSummary,
      VisitSummary,
      DocumentSummary,
    ]),
    forwardRef(() => PatientsModule),
  ],
  controllers: [ClinicalAlertsController],
  providers: [ClinicalAlertsService],
  exports: [ClinicalAlertsService],
})
export class ClinicalAlertsModule {}
