import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadUserDataSession } from '../../../auth/userDataSessionStore';
import { getPatientById, Patient } from '../../../api/patients';
import { uploadDocument } from '../../../api/documents';
import { getMedicalDocumentsPage, deleteMedicalDocument, updateMedicalDocument, MedicalDocument, DocumentTypeEnum } from '../../../api/medical-documents';
import { AsyncStatus, useAsyncData } from '../../../hooks/useAsyncData';
import { useCameraStream } from '../../../hooks/useCameraStream';
import { isSupportedUploadFile, SUPPORTED_FORMATS_LABEL } from '../../PatientDashboard/components/UploadModal';
import { TFilterKey } from '../utils';

const PAGE_SIZE = 20;
const PROCESSING_POLL_INTERVAL_MS = 3000;
const MAX_PROCESSING_POLLS = 40;

export function useDocumentsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userDataSession = loadUserDataSession();
  const isDoctorView = !!id;
  const patientId = id ?? userDataSession?.patientId;

  const [filter, setFilter] = useState<TFilterKey>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [summaryModal, setSummaryModal] = useState<{ id: string; name: string } | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<MedicalDocument | null>(null);
  const [editingDocument, setEditingDocument] = useState<MedicalDocument | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentTypeEnum | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<MedicalDocument[] | null>(null);
  const [documentsStatus, setDocumentsStatus] = useState<AsyncStatus>('loading');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploadingRef = useRef(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const processingPollCountRef = useRef(0);

  const { data: patient } = useAsyncData<Patient | null>(
    () => (patientId ? getPatientById(patientId) : Promise.resolve(null)),
    [patientId],
  );

  // Load page 1 whenever patient, filter, or refresh changes.
  useEffect(() => {
    if (!patientId) {
      setDocuments([]);
      setDocumentsStatus('done');
      setHasMore(false);
      hasMoreRef.current = false;
      return;
    }

    let cancelled = false;
    pageRef.current = 1;
    loadingMoreRef.current = false;
    setLoadingMore(false);
    setDocuments(null);
    setDocumentsStatus('loading');

    getMedicalDocumentsPage({
      patientId,
      page: 1,
      limit: PAGE_SIZE,
      documentType: filter === 'all' ? undefined : filter,
    })
      .then((response) => {
        if (cancelled) return;
        setDocuments(response.items);
        setHasMore(response.hasMore);
        hasMoreRef.current = response.hasMore;
        setDocumentsStatus('done');
      })
      .catch(() => {
        if (cancelled) return;
        setDocuments([]);
        setHasMore(false);
        hasMoreRef.current = false;
        setDocumentsStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [patientId, filter, refreshKey]);

  // Load next page (imperative). Guarded by refs to avoid duplicate scroll triggers.
  const loadMore = useCallback(async () => {
    if (!patientId || !hasMoreRef.current || loadingMoreRef.current) return;

    const nextPage = pageRef.current + 1;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const response = await getMedicalDocumentsPage({
        patientId,
        page: nextPage,
        limit: PAGE_SIZE,
        documentType: filter === 'all' ? undefined : filter,
      });
      pageRef.current = nextPage;
      setDocuments((prev) => [...(prev ?? []), ...response.items]);
      setHasMore(response.hasMore);
      hasMoreRef.current = response.hasMore;
    } catch {
      setDocumentsStatus('error');
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [patientId, filter]);

  // Silently refetch page 1 without flipping to the "loading" state, so the grid
  // does not collapse to the empty-state message and jump between renders.
  const silentRefreshFirstPage = useCallback(async () => {
    if (!patientId) return;
    try {
      const response = await getMedicalDocumentsPage({
        patientId,
        page: 1,
        limit: PAGE_SIZE,
        documentType: filter === 'all' ? undefined : filter,
      });
      setDocuments(response.items);
      setHasMore(response.hasMore);
      hasMoreRef.current = response.hasMore;
    } catch {
      // Silent — next poll or user-triggered refresh will retry.
    }
  }, [patientId, filter]);

  // Poll while any document is still processing, but only on page 1.
  const hasProcessingDocuments = (documents ?? []).some(doc => doc.summaryStatus === 'PROCESSING');
  useEffect(() => {
    if (!hasProcessingDocuments || pageRef.current !== 1) {
      processingPollCountRef.current = 0;
      return;
    }

    const pollInterval = setInterval(() => {
      if (processingPollCountRef.current >= MAX_PROCESSING_POLLS) {
        clearInterval(pollInterval);
        return;
      }
      processingPollCountRef.current += 1;
      void silentRefreshFirstPage();
    }, PROCESSING_POLL_INTERVAL_MS);

    return () => clearInterval(pollInterval);
  }, [hasProcessingDocuments, silentRefreshFirstPage]);

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

  const handleDeleteDocument = async (document: MedicalDocument) => {
    if (!isDoctorView) return;

    const shouldDelete = window.confirm(`למחוק את המסמך "${document.fileName}"?`);
    if (!shouldDelete) return;

    setDeleteError(null);
    setDeletingDocumentId(document.id);
    try {
      await deleteMedicalDocument(document.id);
      setDocuments((prev) => (prev ?? []).filter((item) => item.id !== document.id));
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'מחיקת המסמך נכשלה.');
    } finally {
      setDeletingDocumentId(null);
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

  const handleConfirmDelete = async () => {
    if (!deletingDocument || actionBusy) return;
    setActionBusy(true);
    setActionError(null);
    try {
      await deleteMedicalDocument(deletingDocument.id);
      setDeletingDocument(null);
      setRefreshKey(key => key + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'מחיקת המסמך נכשלה.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleConfirmEditType = async (nextType: DocumentTypeEnum) => {
    if (!editingDocument || actionBusy) return;
    setActionBusy(true);
    setActionError(null);
    try {
      await updateMedicalDocument(editingDocument.id, { documentType: nextType });
      setEditingDocument(null);
      setRefreshKey(key => key + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'עדכון המסמך נכשל.');
    } finally {
      setActionBusy(false);
    }
  };

  const filteredDocuments = documents ?? [];

  return {
    navigate, id, isDoctorView, patientId,
    filter, setFilter,
    uploading, uploadOpen, uploadError, setUploadError,
    deleteError, setDeleteError,
    deletingDocumentId,
    fileError, selectedFile, documentType, setDocumentType,
    fileInputRef, documentsStatus, documents,
    hasMore, loadingMore, loadMore,
    filteredDocuments, summaryModal, setSummaryModal,
    deletingDocument, setDeletingDocument,
    editingDocument, setEditingDocument,
    actionError, setActionError, actionBusy,
    handleConfirmDelete, handleConfirmEditType,
    pageTitle, cameraStream,
    openUploadModal, closeUploadModal,
    handleDeleteDocument,
    handleFileInputChange, handleConfirmUpload, handleCameraCapture,
  };
}
