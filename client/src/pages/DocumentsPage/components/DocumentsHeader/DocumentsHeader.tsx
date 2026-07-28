import React from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
  documentsHeaderRootSx,
  documentsHeaderTitleSx,
  documentsHeaderTitleWrapSx,
  documentsHeaderUploadButtonSx,
} from './styles';

interface IDocumentsHeaderProps {
  title: string;
  isDoctorView: boolean;
  onBack: () => void;
  onUpload: () => void;
}

export const DocumentsHeader: React.FC<IDocumentsHeaderProps> = ({ title, isDoctorView, onBack, onUpload }) => (
  <Box sx={documentsHeaderRootSx}>
    <Box sx={documentsHeaderTitleWrapSx}>
      {isDoctorView && (
        <IconButton onClick={onBack} aria-label="חזרה" size="small">
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      )}
      <Typography noWrap sx={documentsHeaderTitleSx}>
        {title}
      </Typography>
    </Box>
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onUpload}
      sx={documentsHeaderUploadButtonSx}
    >
      העלאת מסמך
    </Button>
  </Box>
);

export default DocumentsHeader;
