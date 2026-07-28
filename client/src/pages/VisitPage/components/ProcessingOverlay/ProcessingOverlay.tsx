import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { processingOverlayRootSx, processingOverlayTextSx } from './styles';

export const ProcessingOverlay: React.FC = () => (
  <Box sx={processingOverlayRootSx}>
    <CircularProgress size={24} />
    <Typography sx={processingOverlayTextSx}>מתמלל שמע...</Typography>
  </Box>
);

export default ProcessingOverlay;
