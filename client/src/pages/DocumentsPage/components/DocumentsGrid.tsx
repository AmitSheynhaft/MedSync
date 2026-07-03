import React from 'react';
import { Box, Typography } from '@mui/material';
import type { MedicalDocument } from '../../../api/medical-documents';
import type { AsyncStatus } from '../../../hooks/useAsyncData';
import { DocumentCard } from './DocumentCard';

interface IDocumentsGridProps {
  patientId: string | undefined;
  documentsStatus: AsyncStatus;
  documents: MedicalDocument[] | null;
  filteredDocuments: MedicalDocument[];
  onDocumentClick: (document: MedicalDocument) => void;
}

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <Typography sx={{ textAlign: 'center', color: '#868e96', fontSize: 14, py: 8 }}>
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
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(280px, 1fr))' }, gap: 2.5 }}>
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
