import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { ClinicsModule } from '../clinics/clinics.module';

@Module({
  imports: [UsersModule, ClinicsModule],
  controllers: [AdminController],
})
export class AdminModule {}
