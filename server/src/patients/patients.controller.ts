import {
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
  Query,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import {
  CreatePatientInput,
  Patient,
  PatientSummary,
  UpdatePatientInput,
} from './patient.types';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { IUser } from '../common/types/entity-interfaces';
import { ROLE_DOCTOR } from '../common/constants/roles';
import { PatientMedicalSummaryService } from '../patient-medical-summary/patient-medical-summary.service';

@Controller('api/patients')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly medicalSummaryService: PatientMedicalSummaryService,
  ) {}

  @Roles(ROLE_DOCTOR)
  @Get()
  getAllPatients(
    @Query('search') searchQuery: string | undefined,
    @User() user: IUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const shouldPaginate = page !== undefined || limit !== undefined;
    if (!shouldPaginate) {
      return this.patientsService.getAllPatients(searchQuery, user);
    }
    return this.patientsService.getAllPatients(
      searchQuery,
      user,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  getPatientById(
    @Param('id', new ParseUUIDPipe()) patientId: string,
    @User() user: IUser,
  ): Promise<Patient> {
    return this.patientsService.getPatientById(patientId, user);
  }

  @Roles(ROLE_DOCTOR)
  @Post()
  createPatient(
    @Body() createPatientInput: CreatePatientInput,
    @User() user: IUser,
  ): Promise<Patient> {
    return this.patientsService.createPatient(createPatientInput, user);
  }

  @Patch(':id')
  updatePatientById(
    @Param('id', new ParseUUIDPipe()) patientId: string,
    @Body() updatePatientInput: UpdatePatientInput,
    @User() user: IUser,
  ): Promise<Patient> {
    return this.patientsService.updatePatientById(
      patientId,
      updatePatientInput,
      user,
    );
  }

  @Roles(ROLE_DOCTOR)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePatientById(
    @Param('id', new ParseUUIDPipe()) patientId: string,
  ): Promise<void> {
    return this.patientsService.deletePatientById(patientId);
  }

  @Post(':id/medical-summary/refresh')
  async refreshMedicalSummary(
    @Param('id', new ParseUUIDPipe()) patientId: string,
    @User() user: IUser,
  ): Promise<Patient> {
    await this.medicalSummaryService.generateAndSavePatientMedicalSummary(
      patientId,
    );
    return this.patientsService.getPatientById(patientId, user);
  }

  // Admin-only bulk operation
  @Roles(ROLE_DOCTOR)
  @Post('medical-summary/regenerate-all')
  regenerateAllMedicalSummaries(): Promise<{
    total: number;
    succeeded: number;
    failed: number;
  }> {
    return this.medicalSummaryService.forceRegenerateAllPatientMedicalSummaries();
  }
}
