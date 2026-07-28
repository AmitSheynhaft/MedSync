import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ClinicalAlertsService } from './clinical-alerts.service';
import {
  BulkRegenerateResult,
  ClinicalAlertDto,
  CreateManualAlertDto,
} from './clinical-alerts.types';
import { PatientsService } from '../patients/patients.service';
import { User } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { IUser } from '../entities';
import { ROLE_DOCTOR } from '../common/constants/roles';

@Controller('api/patients')
export class ClinicalAlertsController {
  constructor(
    private readonly service: ClinicalAlertsService,
    private readonly patientsService: PatientsService,
  ) {}

  @Get(':id/clinical-alerts')
  async list(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ClinicalAlertDto[]> {
    await this.patientsService.assertUserCanAccessPatient(id, user);
    return this.service.getForPatient(id);
  }

  @Roles(ROLE_DOCTOR)
  @Post(':id/clinical-alerts/regenerate')
  async regenerate(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ClinicalAlertDto[]> {
    await this.patientsService.assertUserCanAccessPatient(id, user);
    return this.service.regenerateForPatient(id);
  }

  @Roles(ROLE_DOCTOR)
  @Post(':id/clinical-alerts')
  async createManualAlert(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: CreateManualAlertDto,
  ): Promise<ClinicalAlertDto> {
    await this.patientsService.assertUserCanAccessPatient(id, user);
    return this.service.createManualAlert(id, body);
  }

  @Roles(ROLE_DOCTOR)
  @Delete(':id/clinical-alerts/:alertId')
  @HttpCode(204)
  async deleteManual(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('alertId', new ParseUUIDPipe()) alertId: string,
  ): Promise<void> {
    await this.patientsService.assertUserCanAccessPatient(id, user);
    return this.service.deleteManualAlert(id, alertId);
  }

  // Admin/doctor-only bulk operation
  @Roles(ROLE_DOCTOR)
  @Post('clinical-alerts/regenerate-all')
  regenerateAll(): Promise<BulkRegenerateResult> {
    return this.service.regenerateAll();
  }
}
