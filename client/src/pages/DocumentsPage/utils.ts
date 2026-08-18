import type { MedicalDocument, DocumentTypeEnum, SummaryStatus } from '../../api/medical-documents';

export { DOC_TYPE_LABELS, DOC_TYPE_OPTIONS } from '../../api/medical-documents';

export type TFilterKey = 'all' | DocumentTypeEnum;
export type TFilterOption = { key: TFilterKey; label: string };

export const FILTERS: TFilterOption[] = [
  { key: 'all', label: 'הכל' },
  { key: 'LAB_RESULT', label: 'בדיקות דם' },
  { key: 'DISCHARGE_SUMMARY', label: 'סיכומי ביקור' },
];

export const getFileBadge = (document: MedicalDocument): { label: string; color: string; bg: string } => {
  const format = (document.fileFormat || document.fileName.split('.').pop() || '').toLowerCase();
  if (format.includes('pdf')) return { label: 'PDF', color: '#e03131', bg: '#fff0f0' };
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'img', 'image', 'tiff'].some(ext => format.includes(ext)))
    return { label: 'IMG', color: '#1971c2', bg: '#e7f1ff' };
  if (['doc', 'docx'].some(ext => format.includes(ext)))
    return { label: 'DOC', color: '#2f6f4f', bg: '#e7f6ee' };
  return { label: (format || 'FILE').toUpperCase().slice(0, 4), color: '#495057', bg: '#f1f3f5' };
};

export const getStatusChip = (summaryStatus: SummaryStatus): { label: string; color: string; bg: string } => {
  if (summaryStatus === 'SUCCESS') return { label: 'נותח', color: '#2f9e44', bg: '#ebfbee' };
  if (summaryStatus === 'PROCESSING') return { label: 'מעבד', color: '#e8590c', bg: '#fff4e6' };
  return { label: 'נכשל', color: '#e03131', bg: '#fff0f0' };
};

export const formatDocumentDate = (value: string): string => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('he-IL', { day: '2-digit', month: 'short', year: 'numeric' });
};
