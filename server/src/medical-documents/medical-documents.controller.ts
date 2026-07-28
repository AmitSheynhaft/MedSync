import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  DocumentSummaryInput,
  MedicalDocumentInput,
  MedicalDocumentsService,
} from './medical-documents.service';
import { PatientsService } from '../patients/patients.service';
import { User } from '../common/decorators/user.decorator';
import { IUser } from '../common/types/entity-interfaces';

@Controller('api/medical-documents')
export class MedicalDocumentsController {
  constructor(
    private readonly medicalDocumentsService: MedicalDocumentsService,
    private readonly patientsService: PatientsService,
  ) {}

  @Get()
  async getMedicalDocuments(
    @User() user: IUser,
    @Query('patientId') patientId?: string,
  ) {
    // A patientId is mandatory: without it the query would return documents
    // across all patients. Ownership is always verified against the acting
    // user's clinic/self scope so a secretary cannot read another patient's
    // records, and a patient only ever sees their own.
    if (!patientId) {
      throw new BadRequestException('patientId is required');
    }
    await this.patientsService.assertUserCanAccessPatient(patientId, user);
    return this.medicalDocumentsService.getMedicalDocuments(patientId);
  }

  @Get(':id')
  async getMedicalDocumentById(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) documentId: string,
  ) {
    const medicalDocument =
      await this.medicalDocumentsService.getMedicalDocumentById(documentId);
    await this.patientsService.assertUserCanAccessPatient(
      medicalDocument.patientId,
      user,
    );
    return medicalDocument;
  }

  @Post()
  async createMedicalDocument(
    @User() user: IUser,
    @Body() medicalDocumentInput: MedicalDocumentInput,
  ) {
    await this.patientsService.assertUserCanAccessPatient(
      medicalDocumentInput.patientId,
      user,
    );
    return this.medicalDocumentsService.createMedicalDocument(medicalDocumentInput);
  }

  @Patch(':id')
  async updateMedicalDocumentById(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) documentId: string,
    @Body() medicalDocumentUpdates: Partial<MedicalDocumentInput>,
  ) {
    const medicalDocument =
      await this.medicalDocumentsService.getMedicalDocumentById(documentId);
    await this.patientsService.assertUserCanAccessPatient(
      medicalDocument.patientId,
      user,
    );
    return this.medicalDocumentsService.updateMedicalDocumentById(
      documentId,
      medicalDocumentUpdates,
    );
  }

  @Put(':id/summary')
  async upsertMedicalDocumentSummaryByDocumentId(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) documentId: string,
    @Body() documentSummaryInput: DocumentSummaryInput,
  ) {
    const medicalDocument =
      await this.medicalDocumentsService.getMedicalDocumentById(documentId);
    await this.patientsService.assertUserCanAccessPatient(
      medicalDocument.patientId,
      user,
    );
    return this.medicalDocumentsService.upsertMedicalDocumentSummaryByDocumentId(
      documentId,
      documentSummaryInput,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedicalDocumentById(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) documentId: string,
  ) {
    const medicalDocument =
      await this.medicalDocumentsService.getMedicalDocumentById(documentId);
    await this.patientsService.assertUserCanAccessPatient(
      medicalDocument.patientId,
      user,
    );
    return this.medicalDocumentsService.deleteMedicalDocumentById(documentId);
  }
}
