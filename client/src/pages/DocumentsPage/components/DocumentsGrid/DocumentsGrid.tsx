import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import type { MedicalDocument } from '../../../../api/medical-documents';
import type { AsyncStatus } from '../../../../hooks/useAsyncData';
import { DocumentCard } from '../DocumentCard/DocumentCard';
import { documentsGridEmptyTextSx, documentsGridRootSx, documentsGridScrollSx } from './styles';

interface IDocumentsGridProps {
  patientId: string | undefined;
  documentsStatus: AsyncStatus;
  documents: MedicalDocument[] | null;
  filteredDocuments: MedicalDocument[];
  loadingMore?: boolean;
  onDocumentClick: (document: MedicalDocument) => void;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
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
  if (documentsStatus === 'loading' && !documents) return 'טוען נתונים...';
  if (documentsStatus === 'error' && !documents) return 'טעינת המסמכים נכשלה.';
  if (filteredCount === 0) return 'לא נמצאו מסמכים תואמים.';
  return null;
};

export const DocumentsGrid: React.FC<IDocumentsGridProps> = ({
  patientId, documentsStatus, documents, filteredDocuments, loadingMore, onDocumentClick, onScroll,
}) => {
  const emptyMessage = resolveEmptyMessage(patientId, documentsStatus, documents, filteredDocuments.length);

  if (emptyMessage) {
    return <EmptyState text={emptyMessage} />;
  }

  return (
    <Box onScroll={onScroll} sx={documentsGridScrollSx}>
      <Box sx={documentsGridRootSx}>
        {filteredDocuments.map(document => (
          <DocumentCard
            key={document.id}
            document={document}
            onClick={() => onDocumentClick(document)}
          />
        ))}
      </Box>

      {loadingMore && (
        <Box sx={{ pt: 2 }}>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};

export default DocumentsGrid;
