import React from 'react';
import {
  Tab,
  Stack,
} from '@mui/material';
import PageHeader from '../../components/PageHeader/PageHeader';
import { SlotCard } from './components/SlotCard';
import { CancelSlotDialog } from './components/CancelSlotDialog';
import { usePatientSlots } from './hooks/usePatientSlots';
import {
  ContentWrap,
  PageRoot,
  ScrollArea,
  SlotsTabs,
  StatusText,
} from './styled';

export const PatientSlotsPage: React.FC = () => {
  const {
    tab,
    setTab,
    currentData,
    currentStatus,
    hasMore,
    loadingMore,
    loadMore,
    emptyText,
    pendingCancel,
    setPendingCancel,
    cancelling,
    confirmCancel,
  } = usePatientSlots();

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || loadingMore || currentStatus !== 'done') return;
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - (scrollTop + clientHeight) < 200) {
      void loadMore();
    }
  };

  return (
    <PageRoot>
      <PageHeader title="התורים שלי" subtitle="צפייה בתורים קרובים, קודמים ומבוטלים" showDoctorSubtitle={false} />

      <ScrollArea onScroll={handleScroll}>
        <ContentWrap>
          <SlotsTabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
          >
            <Tab label="תורים קרובים" />
            <Tab label="תורים שעברו" />
            <Tab label="תורים שבוטלו" />
          </SlotsTabs>

          {currentStatus === 'loading' ? (
            <StatusText>טוען תורים...</StatusText>
          ) : currentStatus === 'error' ? (
            <StatusText sx={{ color: 'error.main' }}>טעינת התורים נכשלה.</StatusText>
          ) : !currentData || currentData.length === 0 ? (
            <StatusText>{emptyText}</StatusText>
          ) : (
            <Stack spacing={1.25}>
              {currentData.map(slot => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  onCancel={tab === 0 ? setPendingCancel : undefined}
                  disabled={cancelling}
                />
              ))}
              {loadingMore && (
                <StatusText sx={{ py: 2 }}>טוען עוד תורים...</StatusText>
              )}
            </Stack>
          )}
        </ContentWrap>
      </ScrollArea>

      {Boolean(pendingCancel) && (
        <CancelSlotDialog
          slot={pendingCancel!}
          cancelling={cancelling}
          onClose={() => setPendingCancel(null)}
          onConfirm={confirmCancel}
        />
      )}
    </PageRoot>
  );
};

export default PatientSlotsPage;
