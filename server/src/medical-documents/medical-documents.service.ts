import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalDocument } from './entities/medicalDocumentEntity';
import { DocumentSummary } from '../documents/entities/documentSummaryEntity';
import { DocumentType, SummaryStatus } from '../common/constants/domain-enums';
import { PaginatedResult } from '../common/pagination/pagination.types';
import {
  resolvePagination,
  toPaginatedResult,
} from '../common/pagination/pagination.util';

export interface MedicalDocumentInput {
  patientId: string;
  uploadedByUserId: string;
  summaryStatus?: SummaryStatus;
  documentType?: DocumentType;
  fileName: string;
  fileUrl: string;
  fileFormat?: string;
}

export interface DocumentSummaryInput {
  summaryText: string;
  extractedText: string;
}

@Injectable()
export class MedicalDocumentsService {
  constructor(
    @InjectRepository(MedicalDocument)
    private readonly medicalDocumentRepository: Repository<MedicalDocument>,
    @InjectRepository(DocumentSummary)
    private readonly documentSummaryRepository: Repository<DocumentSummary>,
  ) {}

  async getMedicalDocuments(
    patientId?: string,
    page?: number,
    limit?: number,
    documentType?: DocumentType,
  ): Promise<MedicalDocument[] | PaginatedResult<MedicalDocument>> {
    const where: Record<string, unknown> = {};
    if (patientId) where.patientId = patientId;
    if (documentType) where.documentType = documentType;
    const finalWhere = Object.keys(where).length > 0 ? where : undefined;

    if (page === undefined && limit === undefined) {
      return this.medicalDocumentRepository.find({
        where: finalWhere,
        relations: ['summary'],
        order: { uploadedAt: 'DESC' },
      });
    }

    const pagination = resolvePagination(page, limit);
    const [items, total] = await this.medicalDocumentRepository.findAndCount({
      where: finalWhere,
      relations: ['summary'],
      order: { uploadedAt: 'DESC', id: 'DESC' },
      skip: pagination.skip,
      take: pagination.take,
    });
    return toPaginatedResult(items, total, pagination);
  }

  async getMedicalDocumentById(documentId: string): Promise<MedicalDocument> {
    const medicalDocument = await this.medicalDocumentRepository.findOne({
      where: { id: documentId },
      relations: ['summary', 'patient', 'patient.user', 'uploadedBy'],
    });
    if (!medicalDocument)
      throw new NotFoundException(`Document ${documentId} not found`);
    return medicalDocument;
  }

  async createMedicalDocument(
    medicalDocumentInput: MedicalDocumentInput,
  ): Promise<MedicalDocument> {
    if (
      !medicalDocumentInput?.patientId ||
      !medicalDocumentInput?.uploadedByUserId ||
      !medicalDocumentInput?.fileName ||
      !medicalDocumentInput?.fileUrl
    ) {
      throw new BadRequestException(
        'patientId, uploadedByUserId, fileName and fileUrl are required',
      );
    }
    const medicalDocument = this.medicalDocumentRepository.create({
      patientId: medicalDocumentInput.patientId,
      uploadedByUserId: medicalDocumentInput.uploadedByUserId,
      summaryStatus: medicalDocumentInput.summaryStatus ?? SummaryStatus.SUCCESS,
      documentType: medicalDocumentInput.documentType,
      fileName: medicalDocumentInput.fileName,
      fileUrl: medicalDocumentInput.fileUrl,
      fileFormat: medicalDocumentInput.fileFormat,
      processingCount: 0,
    });
    return this.medicalDocumentRepository.save(medicalDocument);
  }

  async updateMedicalDocumentById(
    documentId: string,
    medicalDocumentUpdates: Partial<MedicalDocumentInput>,
  ): Promise<MedicalDocument> {
    const medicalDocument = await this.getMedicalDocumentById(documentId);
    Object.assign(medicalDocument, medicalDocumentUpdates);
    return this.medicalDocumentRepository.save(medicalDocument);
  }

  async deleteMedicalDocumentById(documentId: string): Promise<void> {
    const deleteResult = await this.medicalDocumentRepository.delete(documentId);
    if (!deleteResult.affected)
      throw new NotFoundException(`Document ${documentId} not found`);
  }

  async upsertMedicalDocumentSummaryByDocumentId(
    documentId: string,
    documentSummaryInput: DocumentSummaryInput,
  ): Promise<DocumentSummary> {
    const medicalDocument = await this.getMedicalDocumentById(documentId);
    let documentSummary = await this.documentSummaryRepository.findOne({
      where: { documentId },
    });
    if (!documentSummary) {
      documentSummary = this.documentSummaryRepository.create({
        documentId: medicalDocument.id,
        summaryText: documentSummaryInput.summaryText,
        extractedText: documentSummaryInput.extractedText,
      });
    } else {
      documentSummary.summaryText = documentSummaryInput.summaryText;
      documentSummary.extractedText = documentSummaryInput.extractedText;
    }
    return this.documentSummaryRepository.save(documentSummary);
  }
}
