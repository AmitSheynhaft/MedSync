import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalDocument } from '../entities/medicalDocument/medicalDocumentEntity';
import { DocumentSummary } from '../entities/documentSummary/documentSummaryEntity';
import { DocumentType, SummaryStatus } from '../entities/enums';
import {
  DocumentFileDataResult,
  DocumentSummaryResult,
  PendingMedicalDocumentResult,
} from './documents.types';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(MedicalDocument)
    private readonly medicalDocumentRepository: Repository<MedicalDocument>,
    @InjectRepository(DocumentSummary)
    private readonly documentSummaryRepository: Repository<DocumentSummary>,
  ) {}

  async createPendingMedicalDocument(
    buffer: Buffer,
    mimeType: string,
    originalName: string,
    patientId: string,
    uploadedByUserId: string,
    documentType?: DocumentType,
  ): Promise<PendingMedicalDocumentResult> {
    const medicalDocument = this.medicalDocumentRepository.create({
      patientId,
      uploadedByUserId,
      summaryStatus: SummaryStatus.PROCESSING,
      documentType,
      fileName: originalName,
      fileUrl: '',
      fileFormat: mimeType,
      processingCount: 0,
      fileData: buffer,
    });
    const savedMedicalDocument =
      await this.medicalDocumentRepository.save(medicalDocument);
    return {
      id: savedMedicalDocument.id,
      filename: savedMedicalDocument.fileName,
      status: savedMedicalDocument.summaryStatus,
      patientId,
    };
  }

  async saveDocumentSummary(
    documentId: string,
    summaryText: string,
    extractedText: string,
  ): Promise<void> {
    await this.documentSummaryRepository.save(
      this.documentSummaryRepository.create({
        documentId,
        summaryText,
        extractedText,
      }),
    );
  }

  async updateDocumentProcessingResult(
    documentId: string,
    summaryStatus: SummaryStatus,
  ): Promise<void> {
    await this.medicalDocumentRepository.update(documentId, {
      summaryStatus,
      processingCount: 1,
    });
  }

  async getDocumentPatientId(documentId: string): Promise<string | null> {
    const medicalDocument = await this.medicalDocumentRepository.findOne({
      where: { id: documentId },
      select: ['patientId'],
    });
    return medicalDocument?.patientId ?? null;
  }

  async getDocumentFileData(
    documentId: string,
  ): Promise<DocumentFileDataResult | null> {
    const medicalDocument = await this.medicalDocumentRepository.findOne({
      where: { id: documentId },
    });
    if (!medicalDocument || !medicalDocument.fileData) return null;
    return {
      buffer: medicalDocument.fileData,
      mimeType: medicalDocument.fileFormat || 'application/octet-stream',
      fileName: medicalDocument.fileName,
      patientId: medicalDocument.patientId ?? null,
    };
  }

  async getDocumentSummaryById(
    documentId: string,
  ): Promise<DocumentSummaryResult | null> {
    const medicalDocument = await this.medicalDocumentRepository.findOne({
      where: { id: documentId },
      relations: ['summary'],
    });
    if (!medicalDocument) return null;
    return {
      summaryText: medicalDocument.summary?.summaryText ?? '',
      fileName: medicalDocument.fileName,
      patientId: medicalDocument.patientId ?? null,
    };
  }
}
