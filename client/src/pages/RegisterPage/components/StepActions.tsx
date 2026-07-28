import React from 'react';
import { Button, Stack } from '@mui/material';
import {
  stepActionsBackButtonSx,
  stepActionsStackSx,
  stepActionsSubmitButtonSx,
} from './StepActions.styles';

interface IStepActionsProps {
  color: string;
  submitting: boolean;
  onBack: () => void;
}

export const StepActions: React.FC<IStepActionsProps> = ({ color, submitting, onBack }) => (
  <Stack direction="row" sx={stepActionsStackSx}>
    <Button type="button" variant="outlined" size="large" onClick={onBack} disabled={submitting}
      sx={stepActionsBackButtonSx(color)}>
      חזרה
    </Button>
    <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}
      sx={stepActionsSubmitButtonSx(color)}>
      {submitting ? 'יוצר חשבון…' : 'יצירת חשבון'}
    </Button>
  </Stack>
);

export default StepActions;
