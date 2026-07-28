import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentsLogicService } from './documents-logic.service';
import { OcrService } from './ocr.service';
import { DocumentSummaryService } from './document-summary.service';
import { MedicalDocument } from '../medical-documents/entities/medicalDocumentEntity';
import { DocumentSummary } from './entities/documentSummaryEntity';
import { PatientMedicalSummaryModule } from '../patient-medical-summary/patient-medical-summary.module';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([MedicalDocument, DocumentSummary]),
    PatientMedicalSummaryModule,
    PatientsModule,
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    DocumentsLogicService,
    OcrService,
    DocumentSummaryService,
  ],
})
export class DocumentsModule {}
