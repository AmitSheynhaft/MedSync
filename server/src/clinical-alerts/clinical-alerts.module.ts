import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicalAlertsController } from './clinical-alerts.controller';
import { ClinicalAlertsService } from './clinical-alerts.service';
import { PatientClinicalAlert } from './entities/patientClinicalAlertEntity';
import { Patient } from '../patients/entities/patientEntity';
import { PatientMedicalSummary } from '../patient-medical-summary/entities/patientMedicalSummaryEntity';
import { VisitSummary } from '../visits/entities/visitSummaryEntity';
import { DocumentSummary } from '../documents/entities/documentSummaryEntity';
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
