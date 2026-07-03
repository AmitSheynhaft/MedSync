/// <reference types="multer" />
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DocumentType } from '../entities/enums';

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
];

@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('document', { limits: { fileSize: MAX_DOCUMENT_BYTES } }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @Body('patientId') patientId?: string,
    @Body('documentType') documentType?: string,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('A document file is required');
    }

    let parsedDocumentType: DocumentType | undefined;
    if (documentType) {
      if (!Object.values(DocumentType).includes(documentType as DocumentType)) {
        throw new BadRequestException(`Invalid document type: ${documentType}`);
      }
      parsedDocumentType = documentType as DocumentType;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Allowed: PDF, PNG, JPEG, WebP`,
      );
    }

    if (file.size > MAX_DOCUMENT_BYTES) {
      throw new BadRequestException('File size exceeds 10 MB limit');
    }

    if (!patientId) {
      throw new BadRequestException('patientId is required');
    }
    const uploadedByUserId = user.id;

    try {
      // Multer decodes multipart filenames as Latin-1; re-encode as UTF-8 for Hebrew/non-ASCII names
      const originalName = Buffer.from(file.originalname, 'latin1').toString(
        'utf8',
      );

      // Save the file immediately and respond; analysis runs in the background.
      const pending = await this.documentsService.createPendingDocument(
        file.buffer,
        file.mimetype,
        originalName,
        patientId,
        uploadedByUserId,
        parsedDocumentType,
      );

      // Fire-and-forget background analysis (OCR + summary). Errors are handled internally.
      void this.documentsService.analyzeDocument(
        pending.id,
        file.buffer,
        file.mimetype,
        originalName,
      );

      return pending;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      const detail = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(detail);
    }
  }

  @Get(':id/download')
  async download(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ) {
    const file = await this.documentsService.getFileData(id);
    if (!file) throw new NotFoundException('File not found');
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.fileName)}"`,
    );
    res.send(file.buffer);
  }

  @Get(':id/summary')
  async getSummary(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.documentsService.getSummary(id);
    if (!result) throw new NotFoundException('Document not found');
    return result;
  }
}
