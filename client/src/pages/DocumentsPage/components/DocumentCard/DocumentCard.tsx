import React from 'react';
import { Box, Card, Chip, CircularProgress, Typography } from '@mui/material';
import type { MedicalDocument } from '../../../../api/medical-documents';
import { getFileBadge, getStatusChip, formatDocumentDate, DOC_TYPE_LABELS } from '../../utils';
import {
  documentCardBadgeWrapSx,
  documentCardFileNameSx,
  documentCardFileTypeChipSx,
  documentCardMetaSx,
  documentCardRootSx,
  documentCardStatusChipSx,
  documentCardStatusProgressSx,
} from './DocumentCard.styles';

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
      sx={documentCardRootSx}
    >
      <Box sx={documentCardBadgeWrapSx}>
        <Chip
          label={badge.label}
          size="small"
          sx={documentCardFileTypeChipSx(badge.color, badge.bg)}
        />
      </Box>
      <Typography title={document.fileName} sx={documentCardFileNameSx}>
        {document.fileName}
      </Typography>
      <Typography sx={documentCardMetaSx}>
        {formatDocumentDate(document.uploadedAt)}
        {document.documentType ? ` • ${DOC_TYPE_LABELS[document.documentType]}` : ''}
      </Typography>
      <Chip
        size="small"
        icon={document.summaryStatus === 'PROCESSING' ? <CircularProgress size={12} sx={documentCardStatusProgressSx(statusInfo.color)} /> : undefined}
        label={statusInfo.label}
        sx={documentCardStatusChipSx(statusInfo.color, statusInfo.bg)}
      />
    </Card>
  );
};

export default DocumentCard;
