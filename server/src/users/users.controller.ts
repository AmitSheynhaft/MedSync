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
import {
  UsersService,
} from './users.service';
import { CreateUserInput, UpdateUserInput } from './types/user.types';
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
    // Strip roleId to prevent self-elevation (C1)
    const { roleId: _stripped, ...safeUserUpdates } = userUpdates;
    return this.usersService.updateUserById(user.id, safeUserUpdates);
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

  @Roles(ROLE_DOCTOR)
  @Post()
  async createUser(@Body() createUserInput: CreateUserInput) {
    const createdUser = await this.usersService.createUser(createUserInput);
    return this.usersService.getUserById(createdUser.id);
  }

  @Roles(ROLE_DOCTOR)
  @Patch(':id')
  updateUserById(
    @Param('id', new ParseUUIDPipe()) userId: string,
    @Body() userUpdates: UpdateUserInput,
  ) {
    // Strip roleId to prevent privilege escalation; role changes are admin-only (C1)
    const { roleId: _stripped, ...safeUserUpdates } = userUpdates;
    return this.usersService.updateUserById(userId, safeUserUpdates);
  }

  @Roles(ROLE_DOCTOR)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUserById(@Param('id', new ParseUUIDPipe()) userId: string) {
    return this.usersService.deleteUserById(userId);
  }
}
