import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { IUser } from '../entities';

@Controller('api/medical-documents')
export class MedicalDocumentsController {
  constructor(
    private readonly service: MedicalDocumentsService,
    private readonly patientsService: PatientsService,
  ) {}

  @Get()
  async findAll(@User() user: IUser, @Query('patientId') patientId?: string) {
    if (patientId) {
      // Enforce clinic-scoped access so a secretary/doctor from another clinic
      // (or a patient requesting someone else's records) cannot list them.
      await this.patientsService.assertCanAccessPatient(patientId, user);
    }
    return this.service.findAll(patientId);
  }

  @Get(':id')
  async findOne(@User() user: IUser, @Param('id', new ParseUUIDPipe()) id: string) {
    const doc = await this.service.findOne(id);
    await this.patientsService.assertCanAccessPatient(doc.patientId, user);
    return doc;
  }

  @Post()
  create(@Body() body: MedicalDocumentInput) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: Partial<MedicalDocumentInput>,
  ) {
    return this.service.update(id, body);
  }

  @Put(':id/summary')
  upsertSummary(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: DocumentSummaryInput,
  ) {
    return this.service.upsertSummary(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
