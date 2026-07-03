import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { SpeechService } from './speech.service';
import { SummaryService } from './summary.service';
import { VisitRecordsController } from './visit-records.controller';
import { VisitRecordsService } from './visit-records.service';
import { Visit } from '../entities/visit/visitEntity';
import { VisitRecording } from '../entities/visitRecording/visitRecordingEntity';
import { VisitSummary } from '../entities/visitSummary/visitSummaryEntity';
import { VisitDiagnosis } from '../entities/visitDiagnosis/visitDiagnosisEntity';
import { VisitMedicine } from '../entities/visitMedicine/visitMedicineEntity';
import { Diagnosis } from '../entities/diagnosis/diagnosisEntity';
import { Medicine } from '../entities/medicine/medicineEntity';
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
