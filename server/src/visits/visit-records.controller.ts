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
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
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
import { IUser } from '../entities';
import { ROLE_DOCTOR, ROLE_PATIENT } from '../common/constants/roles';

@Controller('api/visits-records')
export class VisitRecordsController {
  constructor(private readonly service: VisitRecordsService) {}

  @Get()
  findAll(
    @User() user: IUser,
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
    const actingClinicId = user?.caregiver?.clinicId;
    return this.service.findAll(patientId, caregiverId, actingClinicId);
  }

  @Get(':id')
  async findOne(
    @User() user: IUser,
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

  @Get(':id/summary-pdf')
  async downloadSummaryPdf(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const visit = await this.service.findOne(id);
    if (
      user?.role?.name === ROLE_PATIENT &&
      visit.patientId !== user.patient?.id
    ) {
      throw new NotFoundException('Visit not found');
    }

    const dateSuffix = new Date(visit.visitDate)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    const filename = `medsync-visit-summary-${dateSuffix}.pdf`;

    const file = await this.service.generateSummaryPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(file);
  }

  @Roles(ROLE_DOCTOR)
  @Post()
  create(@User() user: IUser, @Body() body: VisitInput) {
    const caregiverId = user?.caregiver?.id;
    if (!caregiverId) {
      throw new ForbiddenException('No caregiver profile for this user');
    }
    const actingClinicId = user?.caregiver?.clinicId;
    return this.service.create({ ...body, caregiverId, actingClinicId });
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
