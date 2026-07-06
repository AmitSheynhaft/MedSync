import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalDocument } from '../entities/medicalDocument/medicalDocumentEntity';
import { DocumentSummary } from '../entities/documentSummary/documentSummaryEntity';
import { MedicalDocumentsController } from './medical-documents.controller';
import { MedicalDocumentsService } from './medical-documents.service';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalDocument, DocumentSummary]),
    PatientsModule,
  ],
  controllers: [MedicalDocumentsController],
  providers: [MedicalDocumentsService],
  exports: [MedicalDocumentsService],
})
export class MedicalDocumentsModule {}
