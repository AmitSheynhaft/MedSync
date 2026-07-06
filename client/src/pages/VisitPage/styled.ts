import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PageRoot = styled(Box)({
  display: 'flex', flexDirection: 'column', flex: 1,
  overflow: 'hidden', background: '#f6f8fb',
});

export const PatientInfoBarRoot = styled(Box)({
  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
  padding: '8px 24px', background: '#f1f6ff',
  borderBottom: '1px solid #dde6f4', flexShrink: 0,
});

export const FormColumn = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  // A flex child needs `min-height: 0` for its own overflow to kick in;
  // otherwise the default `min-height: auto` causes the column to grow past
  // the parent's clip region and the last section (save button) is hidden.
  minHeight: 0,
  overflowY: 'auto',
  padding: 14,
  gap: 12,
  '@media (min-width:900px)': {
    padding: 20,
    gap: 14,
  },
});

export const FormCard = styled(Paper)({
  borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column',
  gap: 14, position: 'relative', overflow: 'visible',
  border: '1px solid #dde4ee', boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
});
