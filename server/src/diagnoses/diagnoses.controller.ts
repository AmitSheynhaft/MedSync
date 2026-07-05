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
import { DiagnosesService, DiagnosisInput } from './diagnoses.service';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE_DOCTOR } from '../common/constants/roles';

@Roles(ROLE_DOCTOR)
@Controller('api/diagnoses')
export class DiagnosesController {
  constructor(private readonly service: DiagnosesService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: DiagnosisInput) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: Partial<DiagnosisInput>,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
