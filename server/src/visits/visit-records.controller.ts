import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  VisitDiagnosisInput,
  VisitInput,
  VisitMedicineInput,
  VisitRecordingInput,
  VisitRecordsService,
  VisitSummaryInput,
} from './visit-records.service';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { ROLE_DOCTOR, ROLE_PATIENT } from '../common/constants/roles';

@Controller('api/visits-records')
export class VisitRecordsController {
  constructor(private readonly service: VisitRecordsService) {}

  @Get()
  findAll(
    @User() user: any,
    @Query('patientId') patientId?: string,
    @Query('caregiverId') caregiverId?: string,
  ) {
    // Patients may only ever read their own visit records; ignore any
    // client-supplied filters that could target another patient's data.
    if (user?.role?.name === ROLE_PATIENT) {
      const ownPatientId = user.patient?.id;
      if (!ownPatientId) {
        throw new ForbiddenException('No patient profile for this user');
      }
      return this.service.findAll(ownPatientId, undefined);
    }
    return this.service.findAll(patientId, caregiverId);
  }

  @Get(':id')
  async findOne(
    @User() user: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const visit = await this.service.findOne(id);
    // Patients may only read a visit that belongs to them.
    if (
      user?.role?.name === ROLE_PATIENT &&
      visit.patientId !== user.patient?.id
    ) {
      throw new NotFoundException('Visit not found');
    }
    return visit;
  }

  @Roles(ROLE_DOCTOR)
  @Post()
  create(@Body() body: VisitInput) {
    return this.service.create(body);
  }

  @Roles(ROLE_DOCTOR)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: Partial<VisitInput>,
  ) {
    return this.service.update(id, body);
  }

  @Roles(ROLE_DOCTOR)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }

  @Roles(ROLE_DOCTOR)
  @Put(':id/recording')
  upsertRecording(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: VisitRecordingInput,
  ) {
    return this.service.upsertRecording(id, body);
  }

  @Roles(ROLE_DOCTOR)
  @Put(':id/summary')
  upsertSummary(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: VisitSummaryInput,
  ) {
    return this.service.upsertSummary(id, body);
  }

  @Roles(ROLE_DOCTOR)
  @Post(':id/diagnoses')
  addDiagnosis(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: VisitDiagnosisInput,
  ) {
    return this.service.addDiagnosis(id, body);
  }

  @Roles(ROLE_DOCTOR)
  @Delete(':id/diagnoses/:diagnosisId')
  @HttpCode(204)
  removeDiagnosis(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('diagnosisId', new ParseUUIDPipe()) diagnosisId: string,
  ) {
    return this.service.removeDiagnosis(id, diagnosisId);
  }

  @Roles(ROLE_DOCTOR)
  @Post(':id/medicines')
  addMedicine(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: VisitMedicineInput,
  ) {
    return this.service.addMedicine(id, body);
  }

  @Roles(ROLE_DOCTOR)
  @Delete(':id/medicines/:medicineId')
  @HttpCode(204)
  removeMedicine(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('medicineId', new ParseUUIDPipe()) medicineId: string,
  ) {
    return this.service.removeMedicine(id, medicineId);
  }
}
