import React from 'react';
import { Alert, Box, LinearProgress } from '@mui/material';
import DocumentSummaryModal from '../../components/DocumentSummaryModal/DocumentSummaryModal';
import { UPLOAD_ACCEPT_ATTR, UploadModal } from '../PatientDashboard/components/UploadModal';
import { useDocumentsPage } from './hooks/useDocumentsPage';
import { DocumentsHeader } from './components/DocumentsHeader/DocumentsHeader';
import { DocumentsToolbar } from './components/DocumentsToolbar/DocumentsToolbar';
import { DocumentsGrid } from './components/DocumentsGrid/DocumentsGrid';
import { DocumentDeleteDialog } from './components/DocumentDeleteDialog/DocumentDeleteDialog';
import { DocumentEditTypeDialog } from './components/DocumentEditTypeDialog/DocumentEditTypeDialog';

export const DocumentsPage: React.FC = () => {
  const page = useDocumentsPage();

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!page.hasMore || page.loadingMore || page.documentsStatus !== 'done') return;

    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 200;

    if (isNearBottom) {
      void page.loadMore();
    }
  };

  return (
    <Box dir="rtl" sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
      {page.uploading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300 }} />}

      <DocumentsHeader
        title={page.pageTitle}
        isDoctorView={page.isDoctorView}
        onBack={() => page.navigate(`/patients/${page.id}`)}
        onUpload={page.openUploadModal}
      />

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', px: { xs: 2, sm: 4 }, py: { xs: 2.5, sm: 3.5 } }}>
        {page.uploadError && (
          <Alert severity="error" onClose={() => page.setUploadError(null)} sx={{ mb: 3 }}>
            {page.uploadError}
          </Alert>
        )}

        {page.actionError && (
          <Alert severity="error" onClose={() => page.setActionError(null)} sx={{ mb: 3 }}>
            {page.actionError}
          </Alert>
        )}

        <DocumentsToolbar
          activeFilter={page.filter}
          onFilterChange={page.setFilter}
        />

        <DocumentsGrid
          patientId={page.patientId}
          documentsStatus={page.documentsStatus}
          documents={page.documents}
          filteredDocuments={page.filteredDocuments}
          loadingMore={page.loadingMore}
          onDocumentClick={document => page.setSummaryModal({ id: document.id, name: document.fileName })}
          onEditDocument={document => page.setEditingDocument(document)}
          onDeleteDocument={document => page.setDeletingDocument(document)}
          onScroll={handleScroll}
        />
      </Box>

      <input
        ref={page.fileInputRef}
        type="file"
        accept={UPLOAD_ACCEPT_ATTR}
        onChange={page.handleFileInputChange}
        style={{ display: 'none' }}
      />

      <UploadModal
        open={page.uploadOpen}
        onClose={page.closeUploadModal}
        cameraMode={page.cameraStream.cameraMode}
        onStartCamera={() => page.cameraStream.setCameraMode(true)}
        onStopCamera={page.cameraStream.stopCamera}
        cameraError={page.cameraStream.cameraError}
        videoRef={page.cameraStream.videoRef}
        canvasRef={page.cameraStream.canvasRef}
        onCapture={page.handleCameraCapture}
        onChooseFile={() => page.fileInputRef.current?.click()}
        documentType={page.documentType}
        onDocumentTypeChange={page.setDocumentType}
        fileError={page.fileError}
        selectedFileName={page.selectedFile?.name ?? null}
        onConfirmUpload={page.handleConfirmUpload}
      />

      {page.summaryModal && (
        <DocumentSummaryModal
          docId={page.summaryModal.id}
          docName={page.summaryModal.name}
          onClose={() => page.setSummaryModal(null)}
        />
      )}

      <DocumentDeleteDialog
        document={page.deletingDocument}
        busy={page.actionBusy}
        onClose={() => page.setDeletingDocument(null)}
        onConfirm={page.handleConfirmDelete}
      />

      <DocumentEditTypeDialog
        document={page.editingDocument}
        busy={page.actionBusy}
        onClose={() => page.setEditingDocument(null)}
        onConfirm={page.handleConfirmEditType}
      />
    </Box>
  );
};

export default DocumentsPage;
