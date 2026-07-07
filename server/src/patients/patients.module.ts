import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { Patient } from '../entities/patient/patientEntity';
import { User } from '../entities/user/userEntity';
import { Visit } from '../entities/visit/visitEntity';
import { MedicalDocument } from '../entities/medicalDocument/medicalDocumentEntity';
import { PatientMedicalSummary } from '../entities/patientMedicalSummary/patientMedicalSummaryEntity';
import { PatientClinic } from '../entities/patientClinic/patientClinicEntity';
import { Secretary } from '../entities/secretary/secretaryEntity';
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
