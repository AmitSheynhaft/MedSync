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
import {
  CreateUserInput,
  UpdateUserInput,
  UsersService,
} from './users.service';
import { User } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE_DOCTOR } from '../common/constants/roles';

@Controller('api/users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  findMe(@User() user: any) {
    return this.service.findOne(user.id);
  }

  @Patch('me')
  updateMe(@User() user: any, @Body() body: UpdateUserInput) {
    return this.service.update(user.id, body);
  }

  @Roles(ROLE_DOCTOR)
  @Get()
  findAll(@Query('role') role?: string) {
    return this.service.findAll(role);
  }

  @Roles(ROLE_DOCTOR)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Roles(ROLE_DOCTOR)
  @Post()
  async create(@Body() body: CreateUserInput) {
    const user = await this.service.create(body);
    return this.service.findOne(user.id);
  }

  @Roles(ROLE_DOCTOR)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateUserInput,
  ) {
    return this.service.update(id, body);
  }

  @Roles(ROLE_DOCTOR)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
