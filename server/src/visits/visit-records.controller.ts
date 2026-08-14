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
import { VisitRecordsService } from './visit-records.service';
import {
  VisitDiagnosisInput,
  VisitInput,
  VisitMedicineInput,
  VisitRecordingInput,
  VisitSummaryInput,
} from './types/visit-records.types';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { IUser } from '../common/types/entity-interfaces';
import { ROLE_DOCTOR, ROLE_PATIENT } from '../common/constants/roles';

@Controller('api/visits-records')
export class VisitRecordsController {
  constructor(private readonly visitRecordsService: VisitRecordsService) {}

  private assertPatientCanAccessVisit(
    visit: { patientId: string },
    user: IUser,
  ): void {
    if (
      user?.role?.name === ROLE_PATIENT &&
      visit.patientId !== user.patient?.id
    ) {
      throw new NotFoundException('Visit not found');
    }
  }

  /** Throws ForbiddenException if the visit belongs to a different clinic. */
  private async assertClinicAccessForVisit(
    visitId: string,
    user: IUser,
  ): Promise<void> {
    const visit = await this.visitRecordsService.getVisitRecordById(visitId);
    const actingClinicId = user?.caregiver?.clinicId;
    if (
      actingClinicId &&
      visit.caregiver?.clinicId &&
      visit.caregiver.clinicId !== actingClinicId
    ) {
      throw new ForbiddenException('Access denied');
    }
  }

  @Get()
  getVisitRecords(
    @User() user: IUser,
    @Query('patientId') patientId?: string,
    @Query('caregiverId') caregiverId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const shouldPaginate = page !== undefined || limit !== undefined;
    const pageNumber = shouldPaginate ? Number(page) : undefined;
    const limitNumber = shouldPaginate ? Number(limit) : undefined;

    // Patients may only ever read their own visit records; ignore any
    // client-supplied filters that could target another patient's data.
    if (user?.role?.name === ROLE_PATIENT) {
      const ownPatientId = user.patient?.id;
      if (!ownPatientId) {
        throw new ForbiddenException('No patient profile for this user');
      }
      if (!shouldPaginate) {
        return this.visitRecordsService.getVisitRecords(
          ownPatientId,
          undefined,
        );
      }
      return this.visitRecordsService.getVisitRecords(
        ownPatientId,
        undefined,
        undefined,
        pageNumber,
        limitNumber,
      );
    }
    const actingClinicId = user?.caregiver?.clinicId;
    if (!shouldPaginate) {
      return this.visitRecordsService.getVisitRecords(
        patientId,
        caregiverId,
        actingClinicId,
      );
    }
    return this.visitRecordsService.getVisitRecords(
      patientId,
      caregiverId,
      actingClinicId,
      pageNumber,
      limitNumber,
    );
  }

  @Get(':id')
  async getVisitRecordById(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) visitId: string,
  ) {
    const visit = await this.visitRecordsService.getVisitRecordById(visitId);
    this.assertPatientCanAccessVisit(visit, user);
    await this.assertClinicAccessForVisit(visitId, user);
    return visit;
  }

  @Get(':id/summary-pdf')
  async downloadVisitSummaryPdf(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) visitId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const visit = await this.visitRecordsService.getVisitRecordById(visitId);
    this.assertPatientCanAccessVisit(visit, user);
    await this.assertClinicAccessForVisit(visitId, user);

    const dateSuffix = new Date(visit.visitDate)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    const filename = `medsync-visit-summary-${dateSuffix}.pdf`;

    const file = await this.visitRecordsService.generateVisitSummaryPdf(
      visitId,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(file);
  }

  @Roles(ROLE_DOCTOR)
  @Post()
  createVisitRecord(@User() user: IUser, @Body() visitInput: VisitInput) {
    const caregiverId = user?.caregiver?.id;
    if (!caregiverId) {
      throw new ForbiddenException('No caregiver profile for this user');
    }
    const actingClinicId = user?.caregiver?.clinicId;
    return this.visitRecordsService.createVisitRecord({
      ...visitInput,
      caregiverId,
      actingClinicId,
      actingUserId: user.id,
    });
  }

  @Roles(ROLE_DOCTOR)
  @Patch(':id')
  async updateVisitRecordById(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) visitId: string,
    @Body() visitUpdates: Partial<VisitInput>,
  ) {
    await this.assertClinicAccessForVisit(visitId, user);
    return this.visitRecordsService.updateVisitRecordById(
      visitId,
      visitUpdates,
    );
  }

  @Roles(ROLE_DOCTOR)
  @Delete(':id')
  @HttpCode(204)
  async deleteVisitRecordById(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) visitId: string,
  ) {
    await this.assertClinicAccessForVisit(visitId, user);
    return this.visitRecordsService.deleteVisitRecordById(visitId);
  }

  @Roles(ROLE_DOCTOR)
  @Put(':id/recording')
  async upsertVisitRecordingByVisitId(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) visitId: string,
    @Body() visitRecordingInput: VisitRecordingInput,
  ) {
    await this.assertClinicAccessForVisit(visitId, user);
    return this.visitRecordsService.upsertVisitRecordingByVisitId(
      visitId,
      visitRecordingInput,
    );
  }

  @Roles(ROLE_DOCTOR)
  @Put(':id/summary')
  async upsertVisitSummaryByVisitId(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) visitId: string,
    @Body() visitSummaryInput: VisitSummaryInput,
  ) {
    await this.assertClinicAccessForVisit(visitId, user);
    return this.visitRecordsService.upsertVisitSummaryByVisitId(
      visitId,
      visitSummaryInput,
    );
  }

  @Roles(ROLE_DOCTOR)
  @Post(':id/diagnoses')
  async addDiagnosisToVisit(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) visitId: string,
    @Body() visitDiagnosisInput: VisitDiagnosisInput,
  ) {
    await this.assertClinicAccessForVisit(visitId, user);
    return this.visitRecordsService.addDiagnosisToVisit(
      visitId,
      visitDiagnosisInput,
    );
  }

  @Roles(ROLE_DOCTOR)
  @Delete(':id/diagnoses/:diagnosisId')
  @HttpCode(204)
  async removeDiagnosisFromVisit(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) visitId: string,
    @Param('diagnosisId', new ParseUUIDPipe()) diagnosisId: string,
  ) {
    await this.assertClinicAccessForVisit(visitId, user);
    return this.visitRecordsService.removeDiagnosisFromVisit(
      visitId,
      diagnosisId,
    );
  }

  @Roles(ROLE_DOCTOR)
  @Post(':id/medicines')
  async addMedicineToVisit(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) visitId: string,
    @Body() visitMedicineInput: VisitMedicineInput,
  ) {
    await this.assertClinicAccessForVisit(visitId, user);
    return this.visitRecordsService.addMedicineToVisit(
      visitId,
      visitMedicineInput,
    );
  }

  @Roles(ROLE_DOCTOR)
  @Delete(':id/medicines/:medicineId')
  @HttpCode(204)
  async removeMedicineFromVisit(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) visitId: string,
    @Param('medicineId', new ParseUUIDPipe()) medicineId: string,
  ) {
    await this.assertClinicAccessForVisit(visitId, user);
    return this.visitRecordsService.removeMedicineFromVisit(
      visitId,
      medicineId,
    );
  }
}
