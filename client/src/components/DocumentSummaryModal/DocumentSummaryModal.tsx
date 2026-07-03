import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import { getDocumentSummary, downloadDocument } from "../../api/documents";
import MedicalSummary from "../MedicalSummary";

export interface IDocumentSummaryModalProps {
  docId: string;
  docName: string;
  onClose: () => void;
}

export const DocumentSummaryModal: React.FC<IDocumentSummaryModalProps> = ({
  docId,
  docName,
  onClose,
}) => {
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getDocumentSummary(docId)
      .then((r) => {
        if (active) setSummaryText(r.summaryText || "אין סיכום זמין.");
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [docId]);

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      dir="rtl"
      slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: "80vh" } } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          px: 2.5,
          py: 2,
          borderBottom: "1px solid #e9ecef",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              bgcolor: "#f3f0ff",
              color: "#7048e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <DescriptionIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}
            >
              סיכום בינה מלאכותית
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "#868e96",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 360,
              }}
            >
              {docName}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => downloadDocument(docId, docName)}
            sx={{
              whiteSpace: "nowrap",
              gap: 0.5,
              "& .MuiButton-startIcon": { m: 0 },
            }}
          >
            הורד מקור
          </Button>
          <IconButton onClick={onClose} aria-label="סגור" size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              color: "#868e96",
            }}
          >
            <CircularProgress size={18} />
            <Typography sx={{ fontSize: 14 }}>טוען סיכום...</Typography>
          </Box>
        )}
        {!loading && error && (
          <Typography sx={{ color: "#c92a2a", fontSize: 14 }}>
            שגיאה בטעינת הסיכום. נסה שנית.
          </Typography>
        )}
        {!loading && !error && (
          <MedicalSummary text={summaryText ?? ""} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentSummaryModal;
