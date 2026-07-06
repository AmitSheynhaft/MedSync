import React from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SectionCard } from '../../SecretarySchedulePage/styled';

interface IUploadDocumentCardProps {
  onUpload: () => void;
}

export const UploadDocumentCard: React.FC<IUploadDocumentCardProps> = ({ onUpload }) => (
  <SectionCard>
    <Button
      fullWidth
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onUpload}
      sx={{ borderRadius: 3, py: 1.2, fontWeight: 700, whiteSpace: 'nowrap', '& .MuiButton-startIcon': { ml: 1, mr: 0 } }}
    >
      העלאת מסמך
    </Button>
  </SectionCard>
);

export default UploadDocumentCard;
