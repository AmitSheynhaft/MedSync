import React from 'react';
import {
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
    )}
  </Stack>
);

export default FormCardHeader;
