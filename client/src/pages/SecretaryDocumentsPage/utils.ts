import type { UploadResult } from './hooks/useSecretaryDocumentUpload';

interface UploadResultContent {
  title: string;
  message: string;
}

/** Text shown in the post-upload result dialog. */
export const UPLOAD_RESULT_CONTENT: Record<UploadResult, UploadResultContent> = {
  success: {
    title: 'המסמך הועלה בהצלחה',
    message: 'המסמך נשלח לניתוח ויופיע בתיק המטופל בסיום העיבוד.',
  },
  error: {
    title: 'העלאת המסמך נכשלה',
    message: 'אירעה שגיאה בעת העלאת המסמך. נסו שוב.',
  },
};
