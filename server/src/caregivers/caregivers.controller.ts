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
} from '@nestjs/common';
import { CaregiversService } from './caregivers.service';
import { CaregiverInput } from './types/caregiver.types';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE_DOCTOR } from '../common/constants/roles';

@Roles(ROLE_DOCTOR)
@Controller('api/caregivers')
export class CaregiversController {
  constructor(private readonly service: CaregiversService) {}

  @Get()
  getAllCaregivers() {
    return this.service.getAllCaregivers();
  }

  @Get(':id')
  getCaregiverById(@Param('id', new ParseUUIDPipe()) caregiverId: string) {
    return this.service.getCaregiverById(caregiverId);
  }

  @Post()
  createCaregiver(@Body() caregiverInput: CaregiverInput) {
    return this.service.createCaregiver(caregiverInput);
  }

  @Patch('by-user/:userId')
  updateCaregiverByUserId(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() caregiverUpdates: Partial<CaregiverInput>,
  ) {
    return this.service.updateCaregiverByUserId(userId, caregiverUpdates);
  }

  @Patch(':id')
  updateCaregiverById(
    @Param('id', new ParseUUIDPipe()) caregiverId: string,
    @Body() caregiverUpdates: Partial<CaregiverInput>,
  ) {
    return this.service.updateCaregiverById(caregiverId, caregiverUpdates);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCaregiverById(@Param('id', new ParseUUIDPipe()) caregiverId: string) {
    return this.service.deleteCaregiverById(caregiverId);
  }
}
