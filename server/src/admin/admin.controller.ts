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
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE_ADMIN } from '../common/constants/roles';
import { UsersService, CreateUserInput, UpdateUserInput } from '../users/users.service';
import { ClinicsService, ClinicInput } from '../clinics/clinics.service';

@Roles(ROLE_ADMIN)
@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly users: UsersService,
    private readonly clinics: ClinicsService,
  ) {}

  // ── Users ──────────────────────────────────────────────
  @Get('users')
  getAllUsers() {
    return this.users.findAll();
  }

  @Post('users')
  async createUser(@Body() body: CreateUserInput) {
    const user = await this.users.create(body);
    return this.users.findOne(user.id);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateUserInput,
  ) {
    return this.users.update(id, body);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.remove(id);
  }

  // ── Clinics ────────────────────────────────────────────
  @Get('clinics')
  getAllClinics() {
    return this.clinics.getAllClinics();
  }

  @Post('clinics')
  createClinic(@Body() clinicInput: ClinicInput) {
    return this.clinics.createClinic(clinicInput);
  }

  @Patch('clinics/:id')
  updateClinic(
    @Param('id', new ParseUUIDPipe()) clinicId: string,
    @Body() clinicUpdates: Partial<ClinicInput>,
  ) {
    return this.clinics.updateClinicById(clinicId, clinicUpdates);
  }

  @Delete('clinics/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeClinic(@Param('id', new ParseUUIDPipe()) clinicId: string) {
    return this.clinics.deleteClinicById(clinicId);
  }
}
