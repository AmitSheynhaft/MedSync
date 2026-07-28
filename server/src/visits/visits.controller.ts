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
} from './visits.service';
import { SummarizeResult, TranscribeResult } from './types/visits.types';
import {
  MAX_AUDIO_BYTES,
  MAX_SUMMARY_TEXT_CHARS,
} from './constants/visits.constants';
import { Roles } from '../common/decorators/roles.decorator';
import { ROLE_DOCTOR } from '../common/constants/roles';

@Roles(ROLE_DOCTOR)
@Controller('api/visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('audio', { limits: { fileSize: MAX_AUDIO_BYTES } }),
  )
  async transcribeVisitAudio(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TranscribeResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Audio file is required');
    }
    if (file.size > MAX_AUDIO_BYTES) {
      throw new BadRequestException('File size exceeds 25 MB limit');
    }

    try {
      return await this.visitsService.transcribeVisitAudio(file.buffer);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Transcription failed');
    }
  }

  @Post('summarize')
  async summarizeVisitText(
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
      return await this.visitsService.summarizeVisitText(text);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Summarization failed');
    }
  }
}
