import { useRef, useState } from 'react';
import { uploadDocumentFor } from '../../../api/documents';
import { DocumentTypeEnum } from '../../../api/medical-documents';
import { useCameraStream } from '../../../hooks/useCameraStream';
import { isSupportedUploadFile, SUPPORTED_FORMATS_LABEL } from '../../PatientDashboard/components/UploadModal';
import type { BookablePatient } from '../../../api/slots';

export type UploadResult = 'success' | 'error';

/**
 * Drives the secretary document-upload flow: the upload modal (doc type,
 * camera, file picker) and the success/failure result dialog. Uploads are
 * scoped to the selected patient's user id.
 */
export function useSecretaryDocumentUpload(patient: BookablePatient | null) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentTypeEnum | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploadingRef = useRef(false);
  const cameraStream = useCameraStream();

  const openUploadModal = () => {
    setFileError(null);
    setDocumentType(null);
    setSelectedFile(null);
    setUploadOpen(true);
  };

  const closeUploadModal = () => {
    cameraStream.stopCamera();
    setUploadOpen(false);
    setFileError(null);
    setSelectedFile(null);
  };

  const uploadFile = async (file: File) => {
    if (!patient || !documentType || isUploadingRef.current) return;
    isUploadingRef.current = true;
    setUploading(true);
    try {
      await uploadDocumentFor(file, { patientUserId: patient.userId, documentType });
      setResult('success');
    } catch {
      setResult('error');
    } finally {
      setUploading(false);
      isUploadingRef.current = false;
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!isSupportedUploadFile(file)) {
      setSelectedFile(null);
      setFileError(`סוג קובץ לא נתמך. פורמטים נתמכים: ${SUPPORTED_FORMATS_LABEL}`);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
  };

  const confirmUpload = () => {
    if (!selectedFile) return;
    if (!documentType) {
      setFileError('יש לבחור סוג מסמך');
      return;
    }
    const file = selectedFile;
    closeUploadModal();
    uploadFile(file);
  };

  const captureFromCamera = () => {
    cameraStream.capture(file => {
      setUploadOpen(false);
      uploadFile(file);
    });
  };

  const dismissResult = () => setResult(null);

  return {
    uploadOpen,
    documentType,
    setDocumentType,
    selectedFile,
    fileError,
    uploading,
    result,
    fileInputRef,
    cameraStream,
    openUploadModal,
    closeUploadModal,
    handleFileInputChange,
    confirmUpload,
    captureFromCamera,
    dismissResult,
  };
}

export type SecretaryDocumentUploadState = ReturnType<typeof useSecretaryDocumentUpload>;
