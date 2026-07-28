/// <reference types="multer" />
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsLogicService } from './documents-logic.service';
import { User } from '../common/decorators/user.decorator';
import { IUser } from '../common/types/entity-interfaces';
import { MAX_DOCUMENT_UPLOAD_BYTES } from './documents.constants';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly documentsLogicService: DocumentsLogicService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('document', {
      limits: { fileSize: MAX_DOCUMENT_UPLOAD_BYTES },
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @User() user: IUser,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    uploadDocumentDto: UploadDocumentDto,
  ) {
    return this.documentsLogicService.uploadDocumentForUser(
      file,
      user,
      uploadDocumentDto,
    );
  }

  @Get(':id/download')
  async downloadDocument(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) documentId: string,
    @Res() res: Response,
  ) {
    const file = await this.documentsLogicService.getDocumentFileDataForUser(
      documentId,
      user,
    );
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.fileName)}"`,
    );
    res.send(file.buffer);
  }

  @Get(':id/summary')
  async getDocumentSummary(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) documentId: string,
  ) {
    return this.documentsLogicService.getDocumentSummaryForUser(documentId, user);
  }
}
