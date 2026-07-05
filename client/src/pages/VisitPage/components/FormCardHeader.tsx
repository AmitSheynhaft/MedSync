import React from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import StopIcon from "@mui/icons-material/Stop";

interface IFormCardHeaderProps {
  isReadOnly: boolean;
  isProcessing: boolean;
  isStarting: boolean;
  isRecording: boolean;
  onRecord: () => void;
}

export const FormCardHeader: React.FC<IFormCardHeaderProps> = ({
  isReadOnly,
  isProcessing,
  isStarting,
  isRecording,
  onRecord,
}) => (
  <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        color: "#868e96",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        flex: 1,
      }}
    >
      רשומת ביקור
    </Typography>
    <Chip
      label="טיוטה"
      size="small"
      sx={{
        fontSize: 11,
        fontWeight: 600,
        color: "#e8590c",
        background: "#fff3e6",
        border: "none",
        height: 22,
      }}
    />
    {isProcessing && (
      <Chip
        icon={
          <CircularProgress size={10} sx={{ color: "#3b5bdb !important" }} />
        }
        label="מתמלל..."
        size="small"
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: "#3b5bdb",
          background: "#eef2ff",
          height: 22,
        }}
      />
    )}
    {!isReadOnly && (
      <Tooltip
        title="שים לב: יש להפעיל את ההקלטה מתחילת הפגישה ועד סופה כדי להבטיח תיעוד מלא ומדויק."
        placement="top"
      >
        <span>
          <Button
            size="small"
            variant="outlined"
            onClick={onRecord}
            disabled={isProcessing || isStarting}
            sx={{
              minWidth: 36,
              width: 36,
              height: 36,
              p: 0,
              borderRadius: "8px",
              borderColor: "#e9ecef",
              color: isRecording ? "#d9480f" : "#3b5bdb",
              "&:hover": { background: "#eef2ff", borderColor: "#3b5bdb" },
              ...(isStarting ? { background: "#eef2ff" } : {}),
              ...(isRecording
                ? { borderColor: "#ffa8a8", background: "#fff5f5" }
                : {}),
            }}
          >
            {isStarting ? (
              <CircularProgress size={16} sx={{ color: "#3b5bdb" }} />
            ) : isRecording ? (
              <StopIcon sx={{ fontSize: 18 }} />
            ) : (
              <KeyboardVoiceIcon sx={{ fontSize: 18 }} />
            )}
          </Button>
        </span>
      </Tooltip>
    )}
  </Stack>
);

export default FormCardHeader;
