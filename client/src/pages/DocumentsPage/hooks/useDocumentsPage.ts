import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadUserDataSession } from '../../../auth/userDataSessionStore';
import { getPatientById, Patient } from '../../../api/patients';
import { uploadDocument } from '../../../api/documents';
import { getMedicalDocuments, MedicalDocument, DocumentTypeEnum } from '../../../api/medical-documents';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useCameraStream } from '../../../hooks/useCameraStream';
import { isSupportedUploadFile, SUPPORTED_FORMATS_LABEL } from '../../PatientDashboard/components/UploadModal';
import { TFilterKey, DOC_TYPE_LABELS } from '../utils';

export function useDocumentsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userDataSession = loadUserDataSession();
  const isDoctorView = !!id;
  const patientId = id ?? userDataSession?.patientId;

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TFilterKey>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [summaryModal, setSummaryModal] = useState<{ id: string; name: string } | null>(null);
  const [documentType, setDocumentType] = useState<DocumentTypeEnum | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploadingRef = useRef(false);

  const { data: patient } = useAsyncData<Patient | null>(
    () => (patientId ? getPatientById(patientId) : Promise.resolve(null)),
    [patientId],
  );

  const { data: documents, status: documentsStatus } = useAsyncData<MedicalDocument[]>(
    () => (patientId ? getMedicalDocuments(patientId) : Promise.resolve([])),
    [patientId, refreshKey],
  );

  const hasProcessingDocuments = (documents ?? []).some(doc => doc.summaryStatus === 'PROCESSING');
  useEffect(() => {
    if (!hasProcessingDocuments) return;
    const pollInterval = setInterval(() => setRefreshKey(key => key + 1), 3000);
    return () => clearInterval(pollInterval);
  }, [hasProcessingDocuments]);

  const cameraStream = useCameraStream();

  const closeUploadModal = () => {
    cameraStream.stopCamera();
    setUploadOpen(false);
    setFileError(null);
    setSelectedFile(null);
  };

  const openUploadModal = () => {
    setUploadError(null);
    setFileError(null);
    setDocumentType(null);
    setSelectedFile(null);
    setUploadOpen(true);
  };

  const handleUploadFile = async (file: File) => {
    if (!patientId || !documentType) return;
    // Prevent duplicate submissions if an upload is already in flight.
    if (isUploadingRef.current) return;
    isUploadingRef.current = true;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadDocument(file, patientId, documentType);
      setRefreshKey(key => key + 1);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'העלאת המסמך נכשלה.');
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

  const handleConfirmUpload = () => {
    if (!selectedFile) return;
    if (!documentType) {
      setFileError('יש לבחור סוג מסמך');
      return;
    }
    const file = selectedFile;
    closeUploadModal();
    handleUploadFile(file);
  };

  const handleCameraCapture = () => {
    cameraStream.capture(file => {
      setUploadOpen(false);
      handleUploadFile(file);
    });
  };

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'מטופל';
  const pageTitle = isDoctorView ? `מסמכים — ${patientName}` : 'המסמכים הרפואיים שלי';

  const searchTerm = query.trim().toLowerCase();
  const filteredDocuments = (documents ?? []).filter(doc => {
    if (filter !== 'all' && doc.documentType !== filter) return false;
    if (!searchTerm) return true;
    const typeLabel = doc.documentType ? DOC_TYPE_LABELS[doc.documentType] : '';
    return doc.fileName.toLowerCase().includes(searchTerm) || typeLabel.toLowerCase().includes(searchTerm);
  });

  return {
    navigate, id, isDoctorView, patientId,
    query, setQuery, filter, setFilter,
    uploading, uploadOpen, uploadError, setUploadError,
    fileError, selectedFile, documentType, setDocumentType,
    fileInputRef, documentsStatus, documents,
    filteredDocuments, summaryModal, setSummaryModal,
    pageTitle, cameraStream,
    openUploadModal, closeUploadModal,
    handleFileInputChange, handleConfirmUpload, handleCameraCapture,
  };
}
