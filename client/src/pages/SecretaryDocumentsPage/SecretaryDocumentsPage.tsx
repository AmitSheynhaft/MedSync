import React, { useState } from 'react';
import { Box, Stack, Alert, LinearProgress } from '@mui/material';
import PageHeader from '../../components/PageHeader/PageHeader';
import { UploadModal, UPLOAD_ACCEPT_ATTR } from '../PatientDashboard/components/UploadModal';
import type { BookablePatient } from '../../api/slots';
import { useSecretaryDocumentUpload } from './hooks/useSecretaryDocumentUpload';
import { PatientSelectCard } from './components/PatientSelectCard';
import { UploadDocumentCard } from './components/UploadDocumentCard';
import { UploadResultDialog } from './components/UploadResultDialog';

export const SecretaryDocumentsPage: React.FC = () => {
  const [patient, setPatient] = useState<BookablePatient | null>(null);
  const upload = useSecretaryDocumentUpload(patient);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {upload.uploading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300 }} />}

      <PageHeader
        title="העלאת מסמכים למטופל"
        subtitle="בחרו מטופל והעלו עבורו מסמכים רפואיים"
        showDoctorSubtitle={false}
      />

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#f6f8fb', p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2} sx={{ maxWidth: 760, mx: 'auto' }}>
          <PatientSelectCard value={patient} onChange={setPatient} />

          {patient ? (
            <UploadDocumentCard onUpload={upload.openUploadModal} />
          ) : (
            <Alert severity="info">בחרו מטופל כדי להעלות עבורו מסמכים.</Alert>
          )}
        </Stack>
      </Box>

      <input
        ref={upload.fileInputRef}
        type="file"
        accept={UPLOAD_ACCEPT_ATTR}
        onChange={upload.handleFileInputChange}
        style={{ display: 'none' }}
      />

      <UploadModal
        open={upload.uploadOpen}
        onClose={upload.closeUploadModal}
        cameraMode={upload.cameraStream.cameraMode}
        onStartCamera={() => upload.cameraStream.setCameraMode(true)}
        onStopCamera={upload.cameraStream.stopCamera}
        cameraError={upload.cameraStream.cameraError}
        videoRef={upload.cameraStream.videoRef}
        canvasRef={upload.cameraStream.canvasRef}
        onCapture={upload.captureFromCamera}
        onChooseFile={() => upload.fileInputRef.current?.click()}
        documentType={upload.documentType}
        onDocumentTypeChange={upload.setDocumentType}
        fileError={upload.fileError}
        selectedFileName={upload.selectedFile?.name ?? null}
        onConfirmUpload={upload.confirmUpload}
      />

      <UploadResultDialog result={upload.result} onClose={upload.dismissResult} />
    </Box>
  );
};

export default SecretaryDocumentsPage;
