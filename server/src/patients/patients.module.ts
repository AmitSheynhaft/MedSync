import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { Patient } from './entities/patientEntity';
import { User } from '../users/entities/userEntity';
import { Visit } from '../visits/entities/visitEntity';
import { MedicalDocument } from '../medical-documents/entities/medicalDocumentEntity';
import { PatientMedicalSummary } from '../patient-medical-summary/entities/patientMedicalSummaryEntity';
import { PatientClinic } from './entities/patientClinicEntity';
import { Secretary } from '../users/entities/secretaryEntity';
import { RolesModule } from '../roles/roles.module';
import { PatientMedicalSummaryModule } from '../patient-medical-summary/patient-medical-summary.module';
import { ClinicalAlertsModule } from '../clinical-alerts/clinical-alerts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, User, Visit, MedicalDocument, PatientMedicalSummary, PatientClinic, Secretary]),
    RolesModule,
    forwardRef(() => PatientMedicalSummaryModule),
    forwardRef(() => ClinicalAlertsModule),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
