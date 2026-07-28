import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/userEntity';
import { Patient } from '../patients/entities/patientEntity';
import { Caregiver } from '../caregivers/entities/caregiverEntity';
import { Secretary } from '../users/entities/secretaryEntity';
import { Clinic } from '../clinics/entities/clinicEntity';
import { PatientClinic } from '../patients/entities/patientClinicEntity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { RolesModule } from '../roles/roles.module';
import { requireEnv } from '../common/config/require-env';

type JwtExpiresIn = NonNullable<SignOptions['expiresIn']>;

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: requireEnv('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '15m') as JwtExpiresIn,
        },
      }),
    }),
    TypeOrmModule.forFeature([User, Patient, Caregiver, Secretary, Clinic, PatientClinic]),
    RolesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
  exports: [AuthService, TokenService, JwtModule],
})
export class AuthModule {}
