import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { SpeechService } from './speech.service';
import { SummaryService } from './summary.service';
import { VisitRecordsController } from './visit-records.controller';
import { VisitRecordsService } from './visit-records.service';
import { Visit } from './entities/visitEntity';
import { VisitRecording } from './entities/visitRecordingEntity';
import { VisitSummary } from './entities/visitSummaryEntity';
import { VisitDiagnosis } from './entities/visitDiagnosisEntity';
import { VisitMedicine } from './entities/visitMedicineEntity';
import { Diagnosis } from '../diagnoses/entities/diagnosisEntity';
import { Medicine } from '../medicines/entities/medicineEntity';
import { PatientClinic } from '../patients/entities/patientClinicEntity';
import { Patient } from '../patients/entities/patientEntity';
import { Slot } from '../slots/entities/slotEntity';
import { DiagnosesModule } from '../diagnoses/diagnoses.module';
import { MedicinesModule } from '../medicines/medicines.module';
import { PatientMedicalSummaryModule } from '../patient-medical-summary/patient-medical-summary.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Visit,
      VisitRecording,
      VisitSummary,
      VisitDiagnosis,
      VisitMedicine,
      Diagnosis,
      Medicine,
      PatientClinic,
      Patient,
      Slot,
    ]),
    DiagnosesModule,
    MedicinesModule,
    PatientMedicalSummaryModule,
  ],
  controllers: [VisitsController, VisitRecordsController],
  providers: [VisitsService, SpeechService, SummaryService, VisitRecordsService],
  exports: [VisitRecordsService],
})
export class VisitsModule {}
