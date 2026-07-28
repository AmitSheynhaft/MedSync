import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  AuthService,
  AuthResult,
  LoginInput,
  RegisterDoctorInput,
  RegisterPatientInput,
  RegisterSecretaryInput,
  RegisterAdminInput,
} from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../common/decorators/user.decorator';
import { UserRole } from '../common/decorators/currentuser-role.decorator';
import { buildSessionInfo } from './session-payload.util';
import {
  clearAuthCookies,
  getRefreshTokenFromRequest,
  setAuthCookies,
} from './auth-cookie.util';
import { IUser } from '../common/types/entity-interfaces';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}
  private issueSession(res: Response, result: AuthResult) {
    const { accessToken, refreshToken, ...session } = result;
    if (accessToken && refreshToken) {
      setAuthCookies(res, { accessToken, refreshToken });
    }
    return session;
  }

  @Public()
  @Post('register/patient')
  async registerPatient(
    @Body() body: RegisterPatientInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.issueSession(res, await this.service.registerPatient(body));
  }

  @Public()
  @Post('register/doctor')
  async registerDoctor(
    @Body() body: RegisterDoctorInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.issueSession(res, await this.service.registerDoctor(body));
  }

  @Public()
  @Post('register/secretary')
  async registerSecretary(
    @Body() body: RegisterSecretaryInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.issueSession(res, await this.service.registerSecretary(body));
  }

  @Public()
  @Post('register/admin')
  async registerAdmin(
    @Body() body: RegisterAdminInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.issueSession(res, await this.service.registerAdmin(body));
  }

  @Public()
  @Post('login')
  async login(
    @Body() body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.issueSession(res, await this.service.login(body));
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.service.refresh(getRefreshTokenFromRequest(req) ?? '');
    setAuthCookies(res, tokens);
    return { ok: true };
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res);
    return { ok: true };
  }

  @Get('me')
  me(@User() user: IUser, @UserRole() role: string) {
    return buildSessionInfo(user, role);
  }
}
