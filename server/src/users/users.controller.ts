import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserInput } from './types/user.types';
import { User } from '../common/decorators/user.decorator';
import { IUser } from '../common/types/entity-interfaces';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE_DOCTOR } from '../common/constants/roles';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@User() user: IUser) {
    return this.usersService.getUserById(user.id);
  }

  @Patch('me')
  updateCurrentUser(@User() user: IUser, @Body() userUpdates: UpdateUserInput) {
    // Strip role fields: self-elevation is not permitted.
    const { roleId: _r1, roleName: _r2, licenseNumber: _r3, specialization: _r4, clinicId: _r5, idNumber: _r6, ...safeUpdates } = userUpdates;
    return this.usersService.updateUserById(user.id, safeUpdates);
  }

  @Roles(ROLE_DOCTOR)
  @Get()
  getAllUsers(
    @Query('role') roleName?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const shouldPaginate = page !== undefined || limit !== undefined;
    if (!shouldPaginate) {
      return this.usersService.getAllUsers(roleName);
    }
    return this.usersService.getAllUsers(roleName, Number(page), Number(limit));
  }

  @Roles(ROLE_DOCTOR)
  @Get(':id')
  getUserById(@Param('id', new ParseUUIDPipe()) userId: string) {
    return this.usersService.getUserById(userId);
  }
}
