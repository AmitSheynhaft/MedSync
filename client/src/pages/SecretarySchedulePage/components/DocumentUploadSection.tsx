import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useDocumentUpload } from '../../../hooks/useDocumentUpload';

interface IDocumentUploadSectionProps {
  patientUserId: string;
  patientName: string;
}

const STATUS_TEXT: Record<string, string> = {
  uploading: 'מעלה מסמך...',
  processing: 'מנתח מסמך...',
  error: 'העלאת המסמך נכשלה. נסה שוב.',
};

export const DocumentUploadSection: React.FC<IDocumentUploadSectionProps> = ({ patientUserId, patientName }) => {
  const { file, status, summary, fileInputRef, selectFile, upload, reset } = useDocumentUpload(undefined, patientUserId);
  const busy = status === 'uploading' || status === 'processing';

  return (
    <Box>
      <Typography sx={{ fontSize: 13, color: '#868e96', mb: 1.5 }}>
        העלאת מסמכים רפואיים עבור {patientName}
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={selectFile}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ alignItems: { sm: 'center' } }}>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
        >
          בחר קובץ
        </Button>
        <Typography noWrap sx={{ fontSize: 13, color: '#495057', flex: 1, minWidth: 0 }}>
          {file ? file.name : 'לא נבחר קובץ'}
        </Typography>
        <Button variant="contained" onClick={upload} disabled={!file || busy}>
          העלה
        </Button>
      </Stack>

      {busy && (
        <Typography sx={{ mt: 1.5, fontSize: 13, color: '#868e96' }}>{STATUS_TEXT[status]}</Typography>
      )}
      {status === 'error' && (
        <Typography sx={{ mt: 1.5, fontSize: 13, color: 'error.main' }}>{STATUS_TEXT.error}</Typography>
      )}
      {status === 'done' && (
        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#f1fbf3', border: '1px solid #b7ebc6' }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.5 }}>
            <CheckCircleIcon sx={{ color: '#2f9e44', fontSize: 18 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2b8a3e' }}>המסמך הועלה ונותח בהצלחה</Typography>
          </Stack>
          {summary && <Typography sx={{ fontSize: 13, color: '#495057', whiteSpace: 'pre-wrap' }}>{summary}</Typography>}
          <Button size="small" onClick={reset} sx={{ mt: 0.5 }}>העלה מסמך נוסף</Button>
        </Box>
      )}
    </Box>
  );
};

export default DocumentUploadSection;
