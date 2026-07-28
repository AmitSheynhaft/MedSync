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
  constructor(private readonly slotsService: SlotsService) {}

  @Roles(ROLE_SECRETARY)
  @Get('therapists')
  getTherapistOptionsForSecretary(
    @User() user: IUser,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.slotsService.getTherapistOptionsForSecretary(
      user.id,
      search,
      Number(page),
      Number(limit),
    );
  }

  @Roles(ROLE_SECRETARY)
  @Get('patients')
  getBookablePatientsForSecretary(
    @User() user: IUser,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.slotsService.getBookablePatientsForSecretary(
      user.id,
      search,
      Number(page),
      Number(limit),
    );
  }

  @Roles(ROLE_SECRETARY)
  @Get('availability')
  getCaregiverAvailabilityByDate(
    @Query('caregiverId') caregiverId: string,
    @Query('date') date: string,
  ) {
    return this.slotsService.getCaregiverAvailabilityByDate(caregiverId, date);
  }

  @Roles(ROLE_DOCTOR)
  @Get('caregiver')
  getScheduledCaregiverSlotsByDate(
    @User() user: IUser,
    @Query('date') date: string,
  ) {
    return this.slotsService.getScheduledCaregiverSlotsByDate(user.id, date);
  }

  @Roles(ROLE_PATIENT)
  @Get('patient/upcoming')
  getUpcomingSlotsForPatient(@User() user: IUser) {
    return this.slotsService.getUpcomingSlotsForPatient(user.id);
  }

  @Roles(ROLE_PATIENT)
  @Get('patient/past')
  getPastSlotsForPatient(@User() user: IUser) {
    return this.slotsService.getPastSlotsForPatient(user.id);
  }

  @Roles(ROLE_PATIENT)
  @Get('patient/cancelled')
  getCancelledSlotsForPatient(@User() user: IUser) {
    return this.slotsService.getCancelledSlotsForPatient(user.id);
  }

  @Roles(ROLE_SECRETARY)
  @Get('secretary/upcoming')
  getUpcomingSlotsForSecretary(@User() user: IUser) {
    return this.slotsService.getUpcomingSlotsForSecretary(user.id);
  }

  @Roles(ROLE_SECRETARY)
  @Get('secretary/past')
  getPastSlotsForSecretary(@User() user: IUser) {
    return this.slotsService.getPastSlotsForSecretary(user.id);
  }

  @Roles(ROLE_SECRETARY)
  @Post('book')
  bookSlotForSecretary(@User() user: IUser, @Body() bookSlotInput: BookSlotInput) {
    return this.slotsService.bookSlotForSecretary(bookSlotInput, user.id);
  }

  @Roles(ROLE_SECRETARY)
  @Delete('secretary/:id')
  cancelSlotAsSecretary(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) slotId: string,
  ) {
    return this.slotsService.cancelSlotAsSecretary(slotId, user.id);
  }

  @Roles(ROLE_PATIENT)
  @Delete('patient/:id')
  cancelSlotAsPatient(
    @User() user: IUser,
    @Param('id', new ParseUUIDPipe()) slotId: string,
  ) {
    return this.slotsService.cancelSlotAsPatient(slotId, user.id);
  }
}
