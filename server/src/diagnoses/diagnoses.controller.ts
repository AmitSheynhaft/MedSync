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
import { DiagnosesService } from './diagnoses.service';
import { DiagnosisInput } from './types/diagnosis.types';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE_DOCTOR } from '../common/constants/roles';

@Roles(ROLE_DOCTOR)
@Controller('api/diagnoses')
export class DiagnosesController {
  constructor(private readonly service: DiagnosesService) {}

  @Get()
  getAllDiagnoses(@Query('search') searchQuery?: string) {
    return this.service.getAllDiagnoses(searchQuery);
  }

  @Get(':id')
  getDiagnosisById(@Param('id', new ParseUUIDPipe()) diagnosisId: string) {
    return this.service.getDiagnosisById(diagnosisId);
  }

  @Post()
  createDiagnosis(@Body() diagnosisInput: DiagnosisInput) {
    return this.service.createDiagnosis(diagnosisInput);
  }

  @Patch(':id')
  updateDiagnosisById(
    @Param('id', new ParseUUIDPipe()) diagnosisId: string,
    @Body() diagnosisUpdates: Partial<DiagnosisInput>,
  ) {
    return this.service.updateDiagnosisById(diagnosisId, diagnosisUpdates);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDiagnosisById(@Param('id', new ParseUUIDPipe()) diagnosisId: string) {
    return this.service.deleteDiagnosisById(diagnosisId);
  }
}
