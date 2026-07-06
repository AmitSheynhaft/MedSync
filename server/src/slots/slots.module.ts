import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from '../entities/slot/slotEntity';
import { Caregiver } from '../entities/caregiver/caregiverEntity';
import { Secretary } from '../entities/secretary/secretaryEntity';
import { User } from '../entities/user/userEntity';
import { PatientsModule } from '../patients/patients.module';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Slot, Caregiver, Secretary, User]),
    PatientsModule,
  ],
  controllers: [SlotsController],
  providers: [SlotsService],
  exports: [SlotsService],
})
export class SlotsModule {}
