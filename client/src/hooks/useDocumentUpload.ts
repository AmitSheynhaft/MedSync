import { useState, useRef, ChangeEvent } from 'react';
import { uploadDocumentFor, getDocumentSummary } from '../api/documents';
import { getMedicalDocument } from '../api/medical-documents';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 60; // ~2 minutes

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function useDocumentUpload(patientId?: string, patientUserId?: string) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [summary, setSummary] = useState('');
  const [uploadedId, setUploadedId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploadingRef = useRef(false);

  const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus('idle');
      setSummary('');
      setUploadedId(null);
      setUploadedFileName(null);
    }
  };

  const upload = async () => {
    if (!file) return;
    // Guard against re-entrancy (fast double-clicks): the button's disabled
    // state is driven by React state which updates a render later, leaving a
    // window where a second click could fire a duplicate request.
    if (isUploadingRef.current) return;
    isUploadingRef.current = true;
    setStatus('uploading');
    setSummary('');
    setUploadedId(null);
    setUploadedFileName(null);
    try {
      // 1. Upload — server responds immediately with a PROCESSING document.
      const { id, filename } = await uploadDocumentFor(file, { patientId, patientUserId });
      setUploadedId(id);
      setUploadedFileName(filename);
      setStatus('processing');

      // 2. Poll the document status until analysis completes.
      for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
        await delay(POLL_INTERVAL_MS);
        const doc = await getMedicalDocument(id);
        if (doc.summaryStatus === 'PROCESSING') continue;

        if (doc.summaryStatus === 'SUCCESS') {
          const result = await getDocumentSummary(id);
          setSummary(result.summaryText || 'No summary available.');
          setStatus('done');
        } else {
          setSummary('Failed to process document. Please try again.');
          setStatus('error');
        }
        return;
      }

      // Timed out waiting for the job to finish.
      setSummary('Document is still being processed. Check back shortly.');
      setStatus('error');
    } catch {
      setSummary('Failed to process document. Please try again.');
      setStatus('error');
    } finally {
      isUploadingRef.current = false;
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setSummary('');
    setUploadedId(null);
    setUploadedFileName(null);
    isUploadingRef.current = false;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return { file, status, summary, uploadedId, uploadedFileName, fileInputRef, selectFile, upload, reset };
}
