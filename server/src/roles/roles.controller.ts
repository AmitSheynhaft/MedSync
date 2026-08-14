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
import { RoleInput, RolesService } from './roles.service';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE_ADMIN } from '../common/constants/roles';

@Controller('api/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get(':id')
  getRoleById(@Param('id', new ParseUUIDPipe()) roleId: string) {
    return this.rolesService.getRoleById(roleId);
  }

  @Roles(ROLE_ADMIN)
  @Post()
  createRole(@Body() roleInput: RoleInput) {
    return this.rolesService.createRole(roleInput);
  }

  @Roles(ROLE_ADMIN)
  @Patch(':id')
  updateRoleById(
    @Param('id', new ParseUUIDPipe()) roleId: string,
    @Body() roleUpdates: Partial<RoleInput>,
  ) {
    return this.rolesService.updateRoleById(roleId, roleUpdates);
  }

  @Roles(ROLE_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteRoleById(@Param('id', new ParseUUIDPipe()) roleId: string) {
    return this.rolesService.deleteRoleById(roleId);
  }
}
