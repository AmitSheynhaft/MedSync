import React, { RefObject } from "react";
import { Box, Button, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface UploadBannerProps {
  onUploadClick: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadBanner: React.FC<UploadBannerProps> = ({
  onUploadClick,
  fileInputRef,
  onFileChange,
}) => {
  return (
    <Box
      sx={{
        borderRadius: 4,
        p: { xs: 2.5, sm: 4 },
        overflow: "hidden",
        minHeight: 140,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        background: "linear-gradient(135deg, #3b5bdb 0%, #4c6ef5 100%)",
      }}
    >
      <Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "#fff", mb: 0.5 }}
        >
          יש לך מסמך חדש?
        </Typography>
        <Typography
          sx={{
            fontSize: 14,
            color: "rgba(255,255,255,0.8)",
            mb: 2,
            maxWidth: 320,
          }}
        >
          העלה תוצאות בדיקות או הפניות לפני ביקור הבא.
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={onUploadClick}
          sx={{
            bgcolor: "rgba(255,255,255,0.95)",
            color: "primary.main",
            fontWeight: 600,
            "&:hover": { bgcolor: "#fff", transform: "translateY(-1px)" },
          }}
        >
          העלאת מסמך
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          hidden
          onChange={onFileChange}
        />
      </Box>

      <Box sx={{ opacity: 0.7, display: { xs: "none", sm: "block" } }}>
        <svg width="90" height="110" viewBox="0 0 90 110" fill="none">
          <rect
            x="10"
            y="10"
            width="60"
            height="80"
            rx="6"
            fill="rgba(255,255,255,0.15)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2"
          />
          <rect
            x="20"
            y="30"
            width="40"
            height="4"
            rx="2"
            fill="rgba(255,255,255,0.3)"
          />
          <rect
            x="20"
            y="42"
            width="30"
            height="4"
            rx="2"
            fill="rgba(255,255,255,0.2)"
          />
          <rect
            x="20"
            y="54"
            width="35"
            height="4"
            rx="2"
            fill="rgba(255,255,255,0.2)"
          />
          <path
            d="M55 8L75 8L75 30L55 30Z"
            fill="rgba(255,255,255,0.2)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2"
          />
          <path
            d="M55 8L75 30"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2"
          />
        </svg>
      </Box>
    </Box>
  );
};
