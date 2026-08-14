import React from 'react';
import { Box, Typography, Button, Stack, Paper, IconButton, Tooltip } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import { PatientDocument } from '../../../api/patients';
import { downloadDocument } from '../../../api/documents';
import {
  documentActionSx,
  documentDownloadIconSx,
  documentIconSx,
  documentIconWrapSx,
  documentInfoIconSx,
  documentMetaSx,
  documentNameSx,
  documentRowSx,
  documentTextWrapSx,
  documentsListEmptySx,
  documentsListHeaderSx,
  documentsListRootSx,
  documentsListScrollSx,
  documentsListTitleSx,
  documentsListUploadButtonSx,
} from './DocumentsList.styles';

interface DocumentsListProps {
  documents: PatientDocument[];
  onUpload: () => void;
  onViewSummary: (doc: { id: string; name: string }) => void;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({ documents, onUpload, onViewSummary }) => (
  <Box sx={documentsListRootSx}>
    <Stack direction="row" sx={documentsListHeaderSx}>
      <Typography sx={documentsListTitleSx}>מסמכים רפואיים</Typography>
      <Button startIcon={<UploadFileIcon />} size="small" onClick={onUpload} sx={documentsListUploadButtonSx}>
        העלאת מסמך
      </Button>
    </Stack>
    {documents.length === 0 ? (
      <Typography sx={documentsListEmptySx}>אין מסמכים.</Typography>
    ) : (
      <Stack spacing={1} sx={documentsListScrollSx}>
        {documents.map(d => (
          <Paper key={d.id} elevation={0} sx={documentRowSx}>
            <Box sx={documentIconWrapSx}>
              <DescriptionIcon sx={documentIconSx} />
            </Box>
            <Box sx={documentTextWrapSx}>
              <Typography sx={documentNameSx}>{d.name}</Typography>
              <Typography sx={documentMetaSx}>{d.date} • {d.kind}</Typography>
            </Box>
            <Tooltip title="צפה בסיכום">
              <IconButton size="small" sx={documentActionSx} onClick={() => onViewSummary({ id: d.id, name: d.name })}>
                <InfoOutlinedIcon sx={documentInfoIconSx} />
              </IconButton>
            </Tooltip>
            <Tooltip title="הורדה">
              <IconButton size="small" sx={documentActionSx} onClick={() => downloadDocument(d.id, d.name).catch(() => window.alert('הורדת המסמך נכשלה'))}>
                <DownloadIcon sx={documentDownloadIconSx} />
              </IconButton>
            </Tooltip>
          </Paper>
        ))}
      </Stack>
    )}
  </Box>
);

export default DocumentsList;
