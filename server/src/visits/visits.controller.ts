import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  VisitsService,
  TranscribeResult,
  SummarizeResult,
} from './visits.service';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE_DOCTOR } from '../common/constants/roles';

export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const MAX_SUMMARY_TEXT_CHARS = 20_000;

@Roles(ROLE_DOCTOR)
@Controller('api/visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('audio', { limits: { fileSize: MAX_AUDIO_BYTES } }),
  )
  async transcribe(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TranscribeResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Audio file is required');
    }
    if (file.size > MAX_AUDIO_BYTES) {
      throw new BadRequestException('File size exceeds 25 MB limit');
    }

    try {
      return await this.visitsService.transcribe(file.buffer);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      const detail = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(detail);
    }
  }

  @Post('summarize')
  async summarize(
    @Body('text') text?: string,
  ): Promise<SummarizeResult> {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new BadRequestException('text is required');
    }
    if (text.length > MAX_SUMMARY_TEXT_CHARS) {
      throw new BadRequestException(
        `text exceeds ${MAX_SUMMARY_TEXT_CHARS} character limit`,
      );
    }

    try {
      return await this.visitsService.summarizeText(text);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      const detail = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(detail);
    }
  }
}
