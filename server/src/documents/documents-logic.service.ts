import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DocumentSummaryService } from './document-summary.service';
import { DocumentsService } from './documents.service';
import { OcrService } from './ocr.service';
import { DocumentType, SummaryStatus } from '../entities/enums';
import { PatientMedicalSummaryService } from '../patient-medical-summary/patient-medical-summary.service';
import { PatientsService } from '../patients/patients.service';
import { ROLE_PATIENT } from '../common/constants/roles';
import { IUser } from '../entities';
import {
  DocumentFileDataResult,
  DocumentSummaryResult,
  PendingMedicalDocumentResult,
} from './documents.types';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_UPLOAD_BYTES,
} from './documents.constants';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class DocumentsLogicService {
  private readonly logger = new Logger(DocumentsLogicService.name);

  constructor(
    private readonly documentsQueryService: DocumentsService,
    private readonly ocrService: OcrService,
    private readonly documentSummaryService: DocumentSummaryService,
    private readonly medicalSummaryService: PatientMedicalSummaryService,
    private readonly patientsService: PatientsService,
  ) {}

  async uploadDocumentForUser(
    file: Express.Multer.File,
    user: IUser,
    uploadDocumentDto: UploadDocumentDto,
  ): Promise<PendingMedicalDocumentResult> {
    this.validateUploadedFile(file);
    const parsedDocumentType = this.parseDocumentType(uploadDocumentDto.documentType);
    const targetPatientId = await this.resolveTargetPatientId(user, uploadDocumentDto);

    await this.patientsService.assertUserCanAccessPatient(targetPatientId, user);

    try {
      const originalName = this.decodeUploadedFileName(file.originalname);
      const pendingDocument = await this.documentsQueryService.createPendingMedicalDocument(
        file.buffer,
        file.mimetype,
        originalName,
        targetPatientId,
        user.id,
        parsedDocumentType,
      );

      void this.analyzePendingDocument(
        pendingDocument.id,
        file.buffer,
        file.mimetype,
        originalName,
      );

      return pendingDocument;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to upload document: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException('Failed to upload document');
    }
  }

  async getDocumentFileDataForUser(
    documentId: string,
    user: IUser,
  ): Promise<DocumentFileDataResult> {
    const fileData = await this.documentsQueryService.getDocumentFileData(documentId);
    if (!fileData) throw new NotFoundException('File not found');
    if (fileData.patientId) {
      await this.patientsService.assertUserCanAccessPatient(fileData.patientId, user);
    }
    return fileData;
  }

  async getDocumentSummaryForUser(
    documentId: string,
    user: IUser,
  ): Promise<DocumentSummaryResult> {
    const documentSummary = await this.documentsQueryService.getDocumentSummaryById(
      documentId,
    );
    if (!documentSummary) throw new NotFoundException('Document not found');
    if (documentSummary.patientId) {
      await this.patientsService.assertUserCanAccessPatient(
        documentSummary.patientId,
        user,
      );
    }
    return documentSummary;
  }

  private async analyzePendingDocument(
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
        ? await this.documentSummaryService.summarize(extractedText)
        : 'Could not extract any text from the uploaded document.';

      await this.documentsQueryService.saveDocumentSummary(
        documentId,
        summary,
        extractedText ?? '',
      );

      await this.documentsQueryService.updateDocumentProcessingResult(
        documentId,
        hasText ? SummaryStatus.SUCCESS : SummaryStatus.FAILED,
      );
      this.logger.log(`Finished analyzing document ${documentId}`);

      if (!hasText) return;

      const patientId = await this.documentsQueryService.getDocumentPatientId(documentId);
      if (patientId) {
        this.medicalSummaryService
          .generateAndSavePatientMedicalSummary(patientId)
          .catch((error) =>
            this.logger.error(
              `Medical summary trigger failed: ${error instanceof Error ? error.message : String(error)}`,
            ),
          );
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.error(`Background analysis failed for ${documentId}: ${detail}`);
      await this.documentsQueryService.updateDocumentProcessingResult(
        documentId,
        SummaryStatus.FAILED,
      );
    }
  }

  private validateUploadedFile(file: Express.Multer.File | undefined): void {
    if (!file || !file.buffer) {
      throw new BadRequestException('A document file is required');
    }

    if (
      !ALLOWED_DOCUMENT_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Allowed: PDF, PNG, JPEG, WebP`,
      );
    }

    if (file.size > MAX_DOCUMENT_UPLOAD_BYTES) {
      throw new BadRequestException('File size exceeds 10 MB limit');
    }
  }

  private parseDocumentType(documentType?: string): DocumentType | undefined {
    if (!documentType) return undefined;
    if (!Object.values(DocumentType).includes(documentType as DocumentType)) {
      throw new BadRequestException(`Invalid document type: ${documentType}`);
    }
    return documentType as DocumentType;
  }

  private async resolveTargetPatientId(
    user: IUser,
    uploadDocumentDto: UploadDocumentDto,
  ): Promise<string> {
    const { patientId, patientUserId } = uploadDocumentDto;

    if (user?.role?.name === ROLE_PATIENT) {
      const currentPatientId = user.patient?.id;
      if (!currentPatientId) {
        throw new ForbiddenException('No patient profile for this user');
      }
      return currentPatientId;
    }

    if (patientId) return patientId;

    if (patientUserId) {
      const patient = await this.patientsService.ensurePatientProfileForUser(
        patientUserId,
      );
      return patient.id;
    }

    throw new BadRequestException('patientId or patientUserId is required');
  }

  private decodeUploadedFileName(originalName: string): string {
    return Buffer.from(originalName, 'latin1').toString('utf8');
  }
}
