import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { BookSlotInput } from './slot.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import {
  ROLE_DOCTOR,
  ROLE_PATIENT,
  ROLE_SECRETARY,
} from '../common/constants/roles';
import { IUser } from '../entities';

@Controller('api/slots')
export class SlotsController {
  constructor(private readonly service: SlotsService) {}

  @Roles(ROLE_SECRETARY)
  @Get('therapists')
  listTherapists(
    @User() user: IUser,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listTherapists(user.id, search, Number(page), Number(limit));
  }

  @Roles(ROLE_SECRETARY)
  @Get('patients')
  listBookablePatients(
    @User() user: IUser,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listBookablePatients(user.id, search, Number(page), Number(limit));
  }

  @Roles(ROLE_SECRETARY)
  @Get('availability')
  getAvailability(
    @Query('caregiverId') caregiverId: string,
    @Query('date') date: string,
  ) {
    return this.service.getAvailability(caregiverId, date);
  }

  @Roles(ROLE_DOCTOR)
  @Get('caregiver')
  getCaregiverSlots(@User() user: IUser, @Query('date') date: string) {
    return this.service.getCaregiverSlotsByDate(user.id, date);
  }

  @Roles(ROLE_PATIENT)
  @Get('patient/upcoming')
  getPatientUpcoming(@User() user: IUser) {
    return this.service.getPatientUpcoming(user.id);
  }

  @Roles(ROLE_PATIENT)
  @Get('patient/past')
  getPatientPast(@User() user: IUser) {
    return this.service.getPatientPast(user.id);
  }

  @Roles(ROLE_PATIENT)
  @Get('patient/cancelled')
  getPatientCancelled(@User() user: IUser) {
    return this.service.getPatientCancelled(user.id);
  }

  @Roles(ROLE_SECRETARY)
  @Get('secretary/upcoming')
  getSecretaryUpcoming(@User() user: IUser) {
    return this.service.listSecretaryUpcoming(user.id);
  }

  @Roles(ROLE_SECRETARY)
  @Get('secretary/past')
  getSecretaryPast(@User() user: IUser) {
    return this.service.listSecretaryPast(user.id);
  }

  @Roles(ROLE_SECRETARY)
  @Post('book')
  book(@User() user: IUser, @Body() body: BookSlotInput) {
    return this.service.book(body, user.id);
  }

  @Roles(ROLE_SECRETARY)
  @Delete('secretary/:id')
  removeAsSecretary(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.service.removeAsSecretary(id, user.id);
  }
}
