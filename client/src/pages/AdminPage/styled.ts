import { styled } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';

export const PageWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
});

export const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  backgroundColor: '#f6f8fb',
  padding: theme.spacing(3),
  width: '100%',
}));

export const TablePaper = styled(Paper)({
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
});
