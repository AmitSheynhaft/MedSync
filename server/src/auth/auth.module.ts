import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user/userEntity';
import { Patient } from '../entities/patient/patientEntity';
import { Caregiver } from '../entities/caregiver/caregiverEntity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { RolesModule } from '../roles/roles.module';
import { requireEnv } from '../common/config/require-env';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: requireEnv('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '15m') as any,
        },
      }),
    }),
    TypeOrmModule.forFeature([User, Patient, Caregiver]),
    RolesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
  exports: [AuthService, TokenService, JwtModule],
})
export class AuthModule {}
