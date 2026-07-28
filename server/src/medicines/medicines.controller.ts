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
import { MedicineInput, MedicinesService } from './medicines.service';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE_DOCTOR } from '../common/constants/roles';

@Roles(ROLE_DOCTOR)
@Controller('api/medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Get()
  getAllMedicines(@Query('search') searchQuery?: string) {
    return this.medicinesService.getAllMedicines(searchQuery);
  }

  @Get(':id')
  getMedicineById(@Param('id', new ParseUUIDPipe()) medicineId: string) {
    return this.medicinesService.getMedicineById(medicineId);
  }

  @Post()
  createMedicine(@Body() medicineInput: MedicineInput) {
    return this.medicinesService.createMedicine(medicineInput);
  }

  @Patch(':id')
  updateMedicineById(
    @Param('id', new ParseUUIDPipe()) medicineId: string,
    @Body() medicineUpdates: Partial<MedicineInput>,
  ) {
    return this.medicinesService.updateMedicineById(medicineId, medicineUpdates);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMedicineById(@Param('id', new ParseUUIDPipe()) medicineId: string) {
    return this.medicinesService.deleteMedicineById(medicineId);
  }
}
