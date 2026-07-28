import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpeechClient } from '@google-cloud/speech';
import { spawn } from 'child_process';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegPath: string = require('ffmpeg-static');

// Re-encode the browser's WebM/Opus blob into a compact OGG/Opus stream
// (mono, 16 kHz, ~16 kbps) so 30+ minutes fit under the 10 MB inline limit
// and the file has a proper duration header.
function transcodeAudioBufferToOggOpus16kMono(input: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, [
      '-i', 'pipe:0',
      '-vn',
      '-ac', '1',
      '-ar', '16000',
      '-c:a', 'libopus',
      '-b:a', '16k',
      '-application', 'voip',
      '-f', 'ogg',
      'pipe:1',
    ]);
    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];
    proc.stdout.on('data', (c: Buffer) => chunks.push(c));
    proc.stderr.on('data', (c: Buffer) => errChunks.push(c));
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(
          new Error(
            `ffmpeg exited ${code}: ${Buffer.concat(errChunks).toString()}`,
          ),
        );
      }
    });
    proc.stdin.on('error', reject);
    proc.stdin.end(input);
  });
}

@Injectable()
export class SpeechService implements OnModuleInit {
  private readonly logger = new Logger(SpeechService.name);
  private client!: SpeechClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const credentials = this.configService.get<string>(
      'GOOGLE_APPLICATION_CREDENTIALS',
    );
    if (!credentials) {
      this.logger.warn(
        'GOOGLE_APPLICATION_CREDENTIALS is not set — speech transcription will be unavailable',
      );
      return;
    }
    this.client = new SpeechClient({ keyFilename: credentials });
  }

  async transcribeVisitAudio(audioBuffer: Buffer): Promise<string> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'שירות התמלול אינו זמין — GOOGLE_APPLICATION_CREDENTIALS חסר',
      );
    }
    try {
      this.logger.log(
        `Received ${audioBuffer.length} bytes; transcoding to OGG/Opus 16k mono`,
      );
      const compact = await transcodeAudioBufferToOggOpus16kMono(audioBuffer);
      this.logger.log(
        `Transcoded to ${compact.length} bytes; sending to Speech-to-Text`,
      );

      const [operation] = await this.client.longRunningRecognize({
        audio: { content: compact.toString('base64') },
        config: {
          encoding: 'OGG_OPUS',
          sampleRateHertz: 16000,
          audioChannelCount: 1,
          languageCode: 'he-IL',
          enableAutomaticPunctuation: true,
        },
      });
      const [response] = await operation.promise();

      const results = response.results ?? [];
      if (results.length === 0) {
        this.logger.log('Speech-to-Text returned no results');
        return '';
      }

      const transcript = results
        .map((r) => r.alternatives?.[0]?.transcript ?? '')
        .filter((t) => t.length > 0)
        .join(' ');

      this.logger.log(
        `Speech-to-Text transcript (${transcript.length} chars): ${transcript}`,
      );
      return transcript;
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(`Transcription failed: ${detail}`);
    }
  }
}
