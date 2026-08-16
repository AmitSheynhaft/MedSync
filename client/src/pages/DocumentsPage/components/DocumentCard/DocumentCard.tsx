import React from 'react';
import { Box, Card, Chip, CircularProgress, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  onEdit: () => void;
  onDelete: () => void;
}

export const DocumentCard: React.FC<IDocumentCardProps> = ({ document, onClick, onEdit, onDelete }) => {
  const badge = getFileBadge(document);
  const statusInfo = getStatusChip(document.summaryStatus);
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };
  const closeMenu = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setMenuAnchor(null);
  };

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
        <IconButton
          size="small"
          aria-label="פעולות מסמך"
          onClick={openMenu}
          sx={{ ml: 'auto', color: '#868e96' }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={!!menuAnchor}
          onClose={() => closeMenu()}
          onClick={event => event.stopPropagation()}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <MenuItem onClick={event => { closeMenu(event); onEdit(); }}>
            <EditIcon fontSize="small" sx={{ ml: 1 }} /> עריכת סוג
          </MenuItem>
          <MenuItem onClick={event => { closeMenu(event); onDelete(); }} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ ml: 1 }} /> מחיקה
          </MenuItem>
        </Menu>
      </Box>
      <Typography title={document.fileName} sx={documentCardFileNameSx}>
        {document.fileName}
      </Typography>
      <Typography sx={documentCardMetaSx}>
        {formatDocumentDate(document.uploadedAt)}
        {document.documentType && DOC_TYPE_LABELS[document.documentType] ? ` • ${DOC_TYPE_LABELS[document.documentType]}` : ''}
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
