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
import { IUser } from '../entities';
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
  findAll(
    @Query('search') search: string | undefined,
    @User() user: IUser,
  ): Promise<PatientSummary[]> {
    return this.patientsService.findAll(search, user);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: IUser,
  ): Promise<Patient> {
    return this.patientsService.findOne(id, user);
  }

  @Roles(ROLE_DOCTOR)
  @Post()
  create(@Body() body: CreatePatientInput, @User() user: IUser): Promise<Patient> {
    return this.patientsService.create(body, user);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdatePatientInput,
    @User() user: IUser,
  ): Promise<Patient> {
    return this.patientsService.update(id, body, user);
  }

  @Roles(ROLE_DOCTOR)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.patientsService.remove(id);
  }

  @Post(':id/medical-summary/refresh')
  async refreshMedicalSummary(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: IUser,
  ): Promise<Patient> {
    await this.medicalSummaryService.generateAndSave(id);
    return this.patientsService.findOne(id, user);
  }

  // Admin-only bulk operation
  @Roles(ROLE_DOCTOR)
  @Post('medical-summary/regenerate-all')
  regenerateAllMedicalSummaries(): Promise<{
    total: number;
    succeeded: number;
    failed: number;
  }> {
    return this.medicalSummaryService.forceRegenerateAll();
  }
}
