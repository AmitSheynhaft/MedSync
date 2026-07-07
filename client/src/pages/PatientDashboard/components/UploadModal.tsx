import React, { RefObject } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { DocumentTypeEnum } from "../../../api/medical-documents";

const ALLOWED_UPLOAD_EXTENSIONS = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "heic",
  "heif",
];
const ALLOWED_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const SUPPORTED_FORMATS_LABEL =
  "PDF, PNG, JPG, WebP \u00B7 \u05E2\u05D3 10MB";
export const UPLOAD_ACCEPT_ATTR = ".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif";

export function isSupportedUploadFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (
    ALLOWED_UPLOAD_MIME_TYPES.includes(file.type) ||
    ALLOWED_UPLOAD_EXTENSIONS.includes(ext)
  );
}

const DOC_TYPE_OPTIONS: { value: DocumentTypeEnum; label: string }[] = [
  { value: "LAB_RESULT", label: "בדיקות דם" },
  { value: "DISCHARGE_SUMMARY", label: "סיכומי ביקור" },
];

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  cameraMode: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  cameraError: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onCapture: () => void;
  onChooseFile: () => void;
  documentType: DocumentTypeEnum | null;
  onDocumentTypeChange: (type: DocumentTypeEnum) => void;
  fileError?: string | null;
  selectedFileName?: string | null;
  onConfirmUpload: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  open,
  onClose,
  cameraMode,
  onStartCamera,
  onStopCamera,
  cameraError,
  videoRef,
  canvasRef,
  onCapture,
  onChooseFile,
  documentType,
  onDocumentTypeChange,
  fileError,
  selectedFileName,
  onConfirmUpload,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: 4, p: 1, width: '100%', maxWidth: 420, m: 2 } } }}
    >
      <DialogContent
        dir="rtl"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          pt: 4,
        }}
      >
        <Tooltip title="Close">
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 12, right: 12 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {!cameraMode ? (
          <>
            <Avatar
              sx={{
                bgcolor: "#eef2ff",
                color: "primary.main",
                width: 64,
                height: 64,
                mb: 0.5,
              }}
            >
              <CloudUploadIcon fontSize="large" />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              העלאת מסמך
            </Typography>
            <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 1 }}>
              צלם או בחר קובץ
            </Typography>

            <Box sx={{ width: "100%" }}>
              <Typography
                sx={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", mb: 1 }}
              >
                סוג המסמך
              </Typography>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mb: 0.5 }}>
                {DOC_TYPE_OPTIONS.map((opt) => {
                  const active = documentType === opt.value;
                  return (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      onClick={() => onDocumentTypeChange(opt.value)}
                      variant={active ? "filled" : "outlined"}
                      color={active ? "primary" : "default"}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 600,
                        fontSize: 13,
                        height: 34,
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>

            {fileError && (
              <Alert severity="error" sx={{ width: "100%", fontSize: 13 }}>
                {fileError}
              </Alert>
            )}

            {selectedFileName ? (
              <>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.5,
                    borderRadius: 3,
                    border: "1px solid #e9ecef",
                    bgcolor: "#f8f9fa",
                  }}
                >
                  <InsertDriveFileOutlinedIcon sx={{ color: "primary.main" }} />
                  <Typography
                    title={selectedFileName}
                    sx={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1a1a2e",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {selectedFileName}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={onConfirmUpload}
                  disabled={!documentType}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 700,
                  }}
                >
                  העלה
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  color="inherit"
                  onClick={onChooseFile}
                  sx={{ py: 1, borderRadius: 3, color: "text.secondary" }}
                >
                  בחר קובץ אחר
                </Button>
              </>
            ) : (
              <>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CameraAltIcon />}
                  onClick={onStartCamera}
                  disabled={!documentType}
                  sx={{
                    py: 1.5,
                    borderStyle: "dashed",
                    borderRadius: 3,
                  }}
                >
                  צלם
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  startIcon={<PhotoLibraryIcon />}
                  onClick={onChooseFile}
                  disabled={!documentType}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    color: "#1a1a2e",
                    borderColor: "#e9ecef",
                  }}
                >
                  בחר מסמך
                </Button>
              </>
            )}

            <Typography
              sx={{
                fontSize: 12,
                color: "text.secondary",
                mt: 0.5,
                textAlign: "center",
              }}
            >
              {!documentType
                ? "יש לבחור סוג מסמך תחילה"
                : `פורמטים נתמכים: ${SUPPORTED_FORMATS_LABEL}`}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              צלם
            </Typography>
            {cameraError ? (
              <Typography
                color="error"
                sx={{ fontSize: 14, textAlign: "center" }}
              >
                {cameraError}
              </Typography>
            ) : (
              <Box
                component="video"
                ref={videoRef}
                autoPlay
                playsInline
                muted
                sx={{
                  width: "100%",
                  maxHeight: 300,
                  borderRadius: 3,
                  bgcolor: "#000",
                  objectFit: "cover",
                }}
              />
            )}
            <canvas ref={canvasRef} hidden />
            <Stack direction="row" spacing={1.5} sx={{ width: "100%", mt: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={onStopCamera}
                sx={{ flex: 1, borderColor: "#e9ecef", color: "#1a1a2e" }}
              >
                חזר
              </Button>
              {!cameraError && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CameraAltIcon />}
                  onClick={onCapture}
                  sx={{
                    flex: 1,
                  }}
                >
                  צלם
                </Button>
              )}
            </Stack>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
