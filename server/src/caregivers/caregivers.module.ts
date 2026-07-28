import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Caregiver } from './entities/caregiverEntity';
import { CaregiversController } from './caregivers.controller';
import { CaregiversService } from './caregivers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Caregiver])],
  controllers: [CaregiversController],
  providers: [CaregiversService],
  exports: [CaregiversService],
})
export class CaregiversModule {}
