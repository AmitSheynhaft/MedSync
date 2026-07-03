import React, { useRef, useState } from "react";
import { Box, Grid, LinearProgress, Snackbar, Alert } from "@mui/material";
import { DocumentTypeEnum } from "../../api/medical-documents";
import { useCameraStream } from "../../hooks/useCameraStream";
import { AISummaryCard } from "./components/AISummaryCard";
import { DashboardHeader } from "./components/DashboardHeader";
import { DocumentsList } from "./components/DocumentsList";
import { UploadBanner } from "./components/UploadBanner";
import { UploadModal } from "./components/UploadModal";
import { VisitsList } from "./components/VisitsList";
import { usePatientDashboard } from "./hooks/usePatientDashboard";


export const PatientDashboard: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentTypeEnum | null>(
    null,
  );

  const {
    patientId,
    userName,
    userInitials,
    firstName,
    patient,
    documents,
    visits,
    uploading,
    toast,
    setToast,
    uploadFile,
  } = usePatientDashboard();
  const {
    videoRef,
    canvasRef,
    cameraMode,
    setCameraMode,
    cameraError,
    stopCamera,
    capture,
  } = useCameraStream();

  const closeModal = () => {
    stopCamera();
    setShowUploadModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    closeModal();
    uploadFile(file, documentType ?? undefined);
    e.target.value = "";
  };

  const handleCapture = () => {
    capture((file) => {
      setShowUploadModal(false);
      uploadFile(file, documentType ?? undefined);
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {uploading && (
        <LinearProgress
          sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1300 }}
        />
      )}

      <DashboardHeader
        userName={userName}
        userInitials={userInitials}
        firstName={firstName}
      />

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: { xs: 2, sm: 3.5 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 3 },
        }}
      >
        <UploadBanner
          onUploadClick={() => setShowUploadModal(true)}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <AISummaryCard overview={patient?.overview} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <DocumentsList documents={documents} />
          </Grid>
        </Grid>

        <VisitsList visits={visits} patientId={patientId} />
      </Box>

      <UploadModal
        open={showUploadModal}
        onClose={closeModal}
        cameraMode={cameraMode}
        onStartCamera={() => setCameraMode(true)}
        onStopCamera={stopCamera}
        cameraError={cameraError}
        videoRef={videoRef}
        canvasRef={canvasRef}
        onCapture={handleCapture}
        onChooseFile={() => fileInputRef.current?.click()}
        documentType={documentType}
        onDocumentTypeChange={setDocumentType}
        onConfirmUpload={() => {
          if (fileInputRef.current?.files?.[0]) {
            const file = fileInputRef.current.files[0];
            closeModal();
            uploadFile(file, documentType ?? undefined);
            fileInputRef.current.value = "";
          }
        }}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast?.severity}
          variant="filled"
          onClose={() => setToast(null)}
          sx={{ borderRadius: 2 }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientDashboard;
