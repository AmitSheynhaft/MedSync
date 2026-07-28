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

  @Post()
  createRole(@Body() roleInput: RoleInput) {
    return this.rolesService.createRole(roleInput);
  }

  @Patch(':id')
  updateRoleById(
    @Param('id', new ParseUUIDPipe()) roleId: string,
    @Body() roleUpdates: Partial<RoleInput>,
  ) {
    return this.rolesService.updateRoleById(roleId, roleUpdates);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteRoleById(@Param('id', new ParseUUIDPipe()) roleId: string) {
    return this.rolesService.deleteRoleById(roleId);
  }
}
