import React from 'react';
import { Box, Typography } from '@mui/material';
import type { MedicalDocument } from '../../../api/medical-documents';
import type { AsyncStatus } from '../../../hooks/useAsyncData';
import { DocumentCard } from './DocumentCard';
import { documentsGridEmptyTextSx, documentsGridRootSx } from './DocumentsGrid.styles';

interface IDocumentsGridProps {
  patientId: string | undefined;
  documentsStatus: AsyncStatus;
  documents: MedicalDocument[] | null;
  filteredDocuments: MedicalDocument[];
  onDocumentClick: (document: MedicalDocument) => void;
}

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <Typography sx={documentsGridEmptyTextSx}>
    {text}
  </Typography>
);

const resolveEmptyMessage = (
  patientId: string | undefined,
  documentsStatus: AsyncStatus,
  documents: MedicalDocument[] | null,
  filteredCount: number,
): string | null => {
  if (!patientId) return 'לא נמצא מטופל מחובר.';
  if (documentsStatus === 'loading' && !documents) return 'טוען מסמכים...';
  if (documentsStatus === 'error' && !documents) return 'טעינת המסמכים נכשלה.';
  if (filteredCount === 0) return 'לא נמצאו מסמכים תואמים.';
  return null;
};

export const DocumentsGrid: React.FC<IDocumentsGridProps> = ({
  patientId, documentsStatus, documents, filteredDocuments, onDocumentClick,
}) => {
  const emptyMessage = resolveEmptyMessage(patientId, documentsStatus, documents, filteredDocuments.length);

  if (emptyMessage) {
    return <EmptyState text={emptyMessage} />;
  }

  return (
    <Box sx={documentsGridRootSx}>
      {filteredDocuments.map(document => (
        <DocumentCard
          key={document.id}
          document={document}
          onClick={() => onDocumentClick(document)}
        />
      ))}
    </Box>
  );
};

export default DocumentsGrid;
