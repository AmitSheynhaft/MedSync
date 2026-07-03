import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { OcrService } from './ocr.service';
import { DocumentSummaryService } from './document-summary.service';
import { MedicalDocument } from '../entities/medicalDocument/medicalDocumentEntity';
import { DocumentSummary } from '../entities/documentSummary/documentSummaryEntity';
import { PatientMedicalSummaryModule } from '../patient-medical-summary/patient-medical-summary.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([MedicalDocument, DocumentSummary]),
    PatientMedicalSummaryModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, OcrService, DocumentSummaryService],
})
export class DocumentsModule {}
