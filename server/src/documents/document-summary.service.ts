import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

const DOCUMENT_SUMMARY_PROMPT = `Role: Act as a medical data analyst.
Task: Summarize the following blood test results and medical visit summaries.

Output the summary using EXACTLY these section headings, each on its own line, with a blank line between sections:
סיכום מנהלים
ממצאים תקינים
ממצאים חריגים
פריטי פעולה

Under each heading, put the items on their own lines. Use numbered items "1.", "2.", "3." each starting on a new line. For an item with a label and value, write it as "label: value." For abnormal findings include parameter, result vs. reference range, and brief significance (each on a new line or separated by ". ").

Tone: Professional, objective, and concise.
IMPORTANT: Write the entire summary in Hebrew.
IMPORTANT: Output plain text only. Do NOT use Markdown, asterisks, pound signs, pipes, hyphens for lists, or any other formatting symbols. Use real newline characters (\\n) between every heading and every numbered item.

Document text:
`;

@Injectable()
export class DocumentSummaryService implements OnModuleInit {
  private model!: GenerativeModel;
  private readonly logger = new Logger(DocumentSummaryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set — document summarization will be unavailable');
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async summarize(documentText: string): Promise<string> {
    if (!this.model) {
      throw new ServiceUnavailableException('שירות סיכום מסמכים אינו זמין — GEMINI_API_KEY חסר');
    }
    if (!documentText || documentText.trim().length === 0) {
      return '';
    }

    try {
      const result = await this.model.generateContent(
        `${DOCUMENT_SUMMARY_PROMPT}${documentText}`,
      );
      return result.response.text();
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(`Document summarization failed: ${detail}`);
    }
  }
}
