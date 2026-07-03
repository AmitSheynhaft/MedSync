import React from 'react';
import { Alert, Box, LinearProgress } from '@mui/material';
import DocumentSummaryModal from '../../components/DocumentSummaryModal/DocumentSummaryModal';
import { UPLOAD_ACCEPT_ATTR, UploadModal } from '../PatientDashboard/components/UploadModal';
import { useDocumentsPage } from './hooks/useDocumentsPage';
import { DocumentsHeader } from './components/DocumentsHeader';
import { DocumentsToolbar } from './components/DocumentsToolbar';
import { DocumentsGrid } from './components/DocumentsGrid';

export const DocumentsPage: React.FC = () => {
  const page = useDocumentsPage();

  return (
    <Box dir="rtl" sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
      {page.uploading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300 }} />}

      <DocumentsHeader
        title={page.pageTitle}
        isDoctorView={page.isDoctorView}
        onBack={() => page.navigate(`/patients/${page.id}`)}
        onUpload={page.openUploadModal}
      />

      <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, sm: 4 }, py: { xs: 2.5, sm: 3.5 } }}>
        {page.uploadError && (
          <Alert severity="error" onClose={() => page.setUploadError(null)} sx={{ mb: 3 }}>
            {page.uploadError}
          </Alert>
        )}

        <DocumentsToolbar
          query={page.query}
          onQueryChange={page.setQuery}
          activeFilter={page.filter}
          onFilterChange={page.setFilter}
        />

        <DocumentsGrid
          patientId={page.patientId}
          documentsStatus={page.documentsStatus}
          documents={page.documents}
          filteredDocuments={page.filteredDocuments}
          onDocumentClick={document => page.setSummaryModal({ id: document.id, name: document.fileName })}
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
    </Box>
  );
};

export default DocumentsPage;
