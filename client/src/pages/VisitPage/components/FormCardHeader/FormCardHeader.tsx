import React from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import StopIcon from '@mui/icons-material/Stop';
import {
  formCardHeaderDraftChipSx,
  formCardHeaderProcessingChipSx,
  formCardHeaderProcessingIconSx,
  formCardHeaderRecordButtonSx,
  formCardHeaderRecordIconSx,
  formCardHeaderRecordSpinnerSx,
  formCardHeaderRootSx,
  formCardHeaderTitleSx,
  formCardHeaderRecordingIndicatorSx,
  formCardHeaderRecordingDotSx,
  formCardHeaderAudioBarsContainerSx,
  formCardHeaderRecordingLabelSx,
} from './styles';

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
  <Stack direction="row" sx={formCardHeaderRootSx}>
    <Typography sx={formCardHeaderTitleSx}>רשומת ביקור</Typography>
    {!isReadOnly && (
      <Chip label="טיוטה" size="small" sx={formCardHeaderDraftChipSx} />
    )}
    {isProcessing && (
      <Chip
        icon={<CircularProgress size={10} sx={formCardHeaderProcessingIconSx} />}
        label="מתמלל..."
        size="small"
        sx={formCardHeaderProcessingChipSx}
      />
    )}
    {!isReadOnly && (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        {isRecording && (
          <Box sx={formCardHeaderRecordingIndicatorSx}>
            <Box sx={formCardHeaderRecordingDotSx} />
            <Box sx={formCardHeaderAudioBarsContainerSx}>
              {[0, 0.12, 0.24, 0.08, 0.18].map((delay, i) => (
                <Box key={i} component="span" sx={{ animationDelay: `${delay}s` }} />
              ))}
            </Box>
            <Typography sx={formCardHeaderRecordingLabelSx}>מקליט...</Typography>
          </Box>
        )}
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
              sx={formCardHeaderRecordButtonSx(isStarting, isRecording)}
            >
              {isStarting ? (
                <CircularProgress size={16} sx={formCardHeaderRecordSpinnerSx} />
              ) : isRecording ? (
                <StopIcon sx={formCardHeaderRecordIconSx} />
              ) : (
                <KeyboardVoiceIcon sx={formCardHeaderRecordIconSx} />
              )}
            </Button>
          </span>
        </Tooltip>
      </Stack>
    )}
  </Stack>
);

export default FormCardHeader;
