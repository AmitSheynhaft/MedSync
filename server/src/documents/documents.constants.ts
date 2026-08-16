export const MAX_DOCUMENT_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

// Maximum time to wait for background OCR + summarization before marking the
// document as failed. Prevents the status from being stuck on PROCESSING forever
// when the external AI service hangs or the upload is not a real document.
export const DOCUMENT_ANALYSIS_TIMEOUT_MS = 90 * 1000; // 90 seconds
