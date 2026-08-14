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
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE_ADMIN } from '../common/constants/roles';
import { UsersService } from '../users/users.service';
import { CreateUserInput, UpdateUserInput } from '../users/types/user.types';
import { ClinicsService } from '../clinics/clinics.service';
import { ClinicInput } from '../clinics/types/clinic.types';
import { User } from '../common/decorators/user.decorator';
import { IUser } from '../common/types/entity-interfaces';

@Roles(ROLE_ADMIN)
@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly users: UsersService,
    private readonly clinics: ClinicsService,
  ) {}

  // ── Users ──────────────────────────────────────────────
  @Get('users')
  getAllUsers(
    @Query('role') roleName?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const shouldPaginate = page !== undefined || limit !== undefined;
    if (!shouldPaginate) {
      return this.users.getAdminUsers(roleName);
    }
    return this.users.getAdminUsers(roleName, Number(page), Number(limit));
  }

  @Post('users')
  async createUser(@Body() createUserInput: CreateUserInput) {
    const createdUser = await this.users.createUser(createUserInput);
    return this.users.getUserById(createdUser.id);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id', new ParseUUIDPipe()) userId: string,
    @Body() userUpdates: UpdateUserInput,
    @User() actingUser: IUser,
  ) {
    return this.users.updateUserByIdAsAdmin(userId, userUpdates, actingUser);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUser(
    @Param('id', new ParseUUIDPipe()) userId: string,
    @User() actingUser: IUser,
  ) {
    return this.users.deleteUserById(userId, actingUser);
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
