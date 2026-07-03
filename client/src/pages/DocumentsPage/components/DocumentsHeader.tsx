import React from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface IDocumentsHeaderProps {
  title: string;
  isDoctorView: boolean;
  onBack: () => void;
  onUpload: () => void;
}

export const DocumentsHeader: React.FC<IDocumentsHeaderProps> = ({ title, isDoctorView, onBack, onUpload }) => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
      px: { xs: 2, sm: 4 }, minHeight: 72, bgcolor: '#fff', borderBottom: '1px solid #e9ecef', flexShrink: 0,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      {isDoctorView && (
        <IconButton onClick={onBack} aria-label="חזרה" size="small">
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      )}
      <Typography noWrap sx={{ fontSize: { xs: 18, sm: 22 }, fontWeight: 800, color: '#1a1a2e' }}>
        {title}
      </Typography>
    </Box>
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onUpload}
      sx={{ borderRadius: 3, px: { xs: 2, sm: 2.5 }, py: 1.2, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap', '& .MuiButton-startIcon': { ml: 1, mr: 0 } }}
    >
      העלאת מסמך
    </Button>
  </Box>
);

export default DocumentsHeader;
