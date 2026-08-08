import { Box, DialogActions, Tabs, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PageRoot = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
});

export const ScrollArea = styled(Box)({
  flex: 1,
  overflow: 'auto',
  backgroundColor: '#f6f8fb',
  padding: '16px',
  '@media (min-width:600px)': {
    padding: '24px',
  },
});

export const ContentWrap = styled(Box)({
  maxWidth: 760,
  marginInline: 'auto',
});

export const SlotsTabs = styled(Tabs)({
  marginBottom: 16,
  minHeight: 40,
  backgroundColor: '#fff',
  borderRadius: 8,
  border: '1px solid #e9ecef',
  padding: 4,
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .MuiTab-root': {
    fontWeight: 600,
    minWidth: 0,
    minHeight: 36,
    paddingInline: 8,
    fontSize: 14,
    borderRadius: 6,
    color: '#495057',
  },
  '& .Mui-selected': {
    backgroundColor: '#eef2ff',
  },
  '@media (max-width:599px)': {
    '& .MuiTab-root': {
      paddingInline: 4,
      fontSize: 12,
    },
  },
});

export const StatusText = styled(Typography)({
  textAlign: 'center',
  color: '#868e96',
  paddingBlock: 32,
});

export const CancelDialogActions = styled(DialogActions)({
  paddingInline: 24,
  paddingBottom: 16,
});
