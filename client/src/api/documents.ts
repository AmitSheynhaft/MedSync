import { apiRequest } from './client';
import { SummaryStatus, DocumentTypeEnum } from './medical-documents';

export interface DocumentUploadResult {
  id: string;
  filename: string;
  status: SummaryStatus;
  patientId: string;
}

export function uploadDocument(
  file: File,
  patientId?: string,
  documentType?: DocumentTypeEnum,
): Promise<DocumentUploadResult> {
  const formData = new FormData();
  formData.append('document', file);
  if (patientId) formData.append('patientId', patientId);
  if (documentType) formData.append('documentType', documentType);

  return apiRequest<DocumentUploadResult>('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function downloadDocument(id: string, fileName: string): Promise<void> {
  const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';
  const res = await fetch(`${BASE_URL}/api/documents/${id}/download`);
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function getDocumentSummary(id: string): Promise<{ summaryText: string; fileName: string }> {
  return apiRequest<{ summaryText: string; fileName: string }>(`/api/documents/${id}/summary`);
}
