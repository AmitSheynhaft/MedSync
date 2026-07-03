import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OcrService } from './ocr.service';
import { DocumentSummaryService } from './document-summary.service';
import { MedicalDocument } from '../entities/medicalDocument/medicalDocumentEntity';
import { DocumentSummary } from '../entities/documentSummary/documentSummaryEntity';
import { DocumentType, SummaryStatus } from '../entities/enums';
import { PatientMedicalSummaryService } from '../patient-medical-summary/patient-medical-summary.service';

export interface DocumentResult {
  id: string;
  filename: string;
  extractedText: string;
  summary: string;
  patientId: string | null;
}

export interface PendingDocumentResult {
  id: string;
  filename: string;
  status: SummaryStatus;
  patientId: string;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly ocrService: OcrService,
    private readonly summaryService: DocumentSummaryService,
    @InjectRepository(MedicalDocument)
    private readonly medicalDocuments: Repository<MedicalDocument>,
    @InjectRepository(DocumentSummary)
    private readonly documentSummaries: Repository<DocumentSummary>,
    private readonly medicalSummaryService: PatientMedicalSummaryService,
  ) {}

  /**
   * Persists the uploaded file immediately with a PROCESSING status and returns
   * right away. The heavy OCR + summarization work is kicked off in the
   * background via {@link analyzeDocument} so the client can poll for status.
   */
  async createPendingDocument(
    buffer: Buffer,
    mimeType: string,
    originalName: string,
    patientId: string,
    uploadedByUserId: string,
    documentType?: DocumentType,
  ): Promise<PendingDocumentResult> {
    const doc = this.medicalDocuments.create({
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
    const saved = await this.medicalDocuments.save(doc);
    return {
      id: saved.id,
      filename: originalName,
      status: saved.summaryStatus,
      patientId,
    };
  }

  /**
   * Background job: runs OCR + summarization and updates the document row to
   * SUCCESS or FAILED. Never throws — failures are recorded on the row.
   */
  async analyzeDocument(
    documentId: string,
    buffer: Buffer,
    mimeType: string,
    originalName: string,
  ): Promise<void> {
    this.logger.log(
      `Analyzing document ${documentId}: ${originalName} (${mimeType})`,
    );
    try {
      const extractedText = await this.ocrService.extractText(buffer, mimeType);
      const hasText = !!extractedText && extractedText.trim().length > 0;

      const summary = hasText
        ? await this.summaryService.summarize(extractedText)
        : 'Could not extract any text from the uploaded document.';

      await this.documentSummaries.save(
        this.documentSummaries.create({
          documentId,
          summaryText: summary,
          extractedText: extractedText ?? '',
        }),
      );

      await this.medicalDocuments.update(documentId, {
        summaryStatus: hasText ? SummaryStatus.SUCCESS : SummaryStatus.FAILED,
        processingCount: 1,
      });
      this.logger.log(`Finished analyzing document ${documentId}`);

      if (hasText) {
        const doc = await this.medicalDocuments.findOne({
          where: { id: documentId },
          select: ['patientId'],
        });
        if (doc?.patientId) {
          this.medicalSummaryService
            .generateAndSave(doc.patientId)
            .catch((e) =>
              this.logger.error(
                `Medical summary trigger failed: ${e instanceof Error ? e.message : String(e)}`,
              ),
            );
        }
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Background analysis failed for ${documentId}: ${detail}`,
      );
      await this.medicalDocuments.update(documentId, {
        summaryStatus: SummaryStatus.FAILED,
        processingCount: 1,
      });
    }
  }

  async getFileData(
    id: string,
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | null> {
    const doc = await this.medicalDocuments.findOne({ where: { id } });
    if (!doc || !doc.fileData) return null;
    return {
      buffer: doc.fileData,
      mimeType: doc.fileFormat || 'application/octet-stream',
      fileName: doc.fileName,
    };
  }

  async getSummary(
    id: string,
  ): Promise<{ summaryText: string; fileName: string } | null> {
    const doc = await this.medicalDocuments.findOne({
      where: { id },
      relations: ['summary'],
    });
    if (!doc) return null;
    return {
      summaryText: doc.summary?.summaryText ?? '',
      fileName: doc.fileName,
    };
  }
}
