import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VisitsModule } from './visits/visits.module';
import { DocumentsModule } from './documents/documents.module';
import { PatientsModule } from './patients/patients.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CaregiversModule } from './caregivers/caregivers.module';
import { SlotsModule } from './slots/slots.module';
import { DiagnosesModule } from './diagnoses/diagnoses.module';
import { MedicinesModule } from './medicines/medicines.module';
import { MedicalDocumentsModule } from './medical-documents/medical-documents.module';
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PatientMedicalSummaryModule } from './patient-medical-summary/patient-medical-summary.module';
import { ClinicalAlertsModule } from './clinical-alerts/clinical-alerts.module';
import { ClinicsModule } from './clinics/clinics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') ?? '5432', 10),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    RolesModule,
    UsersModule,
    AuthModule,
    CaregiversModule,
    PatientsModule,
    SlotsModule,
    DiagnosesModule,
    MedicinesModule,
    MedicalDocumentsModule,
    VisitsModule,
    DocumentsModule,
    PatientMedicalSummaryModule,
    ClinicalAlertsModule,
    ClinicsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
