import React from 'react';
import { Box, Card, Chip, CircularProgress, Typography } from '@mui/material';
import type { MedicalDocument } from '../../../api/medical-documents';
import { getFileBadge, getStatusChip, formatDocumentDate, DOC_TYPE_LABELS } from '../utils';

interface IDocumentCardProps {
  document: MedicalDocument;
  onClick: () => void;
}

export const DocumentCard: React.FC<IDocumentCardProps> = ({ document, onClick }) => {
  const badge = getFileBadge(document);
  const statusInfo = getStatusChip(document.summaryStatus);

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: '1px solid #eef0f3',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
        transition: 'all .18s',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(16,24,40,0.1)',
          transform: 'translateY(-2px)',
          borderColor: '#dfe3ea',
        },
      }}
    >
      <Box sx={{ mb: 2.25 }}>
        <Chip
          label={badge.label}
          size="small"
          sx={{ fontWeight: 800, fontSize: 11, letterSpacing: '.04em', color: badge.color, bgcolor: badge.bg, borderRadius: 2 }}
        />
      </Box>
      <Typography
        title={document.fileName}
        sx={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', mb: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {document.fileName}
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#868e96', mb: 2 }}>
        {formatDocumentDate(document.uploadedAt)}
        {document.documentType ? ` • ${DOC_TYPE_LABELS[document.documentType]}` : ''}
      </Typography>
      <Chip
        size="small"
        icon={document.summaryStatus === 'PROCESSING' ? <CircularProgress size={12} sx={{ color: statusInfo.color }} /> : undefined}
        label={statusInfo.label}
        sx={{
          fontWeight: 800, fontSize: 11, letterSpacing: '.05em',
          color: statusInfo.color, bgcolor: statusInfo.bg, borderRadius: 2,
          '& .MuiChip-icon': { color: statusInfo.color },
        }}
      />
    </Card>
  );
};

export default DocumentCard;
