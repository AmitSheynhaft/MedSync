import { Controller, Get } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('api/clinics')
export class ClinicsController {
  constructor(private readonly service: ClinicsService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
