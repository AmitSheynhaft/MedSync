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
  overflowY: 'visible',
  padding: 14,
  gap: 12,
  '@media (min-width:900px)': {
    overflowY: 'auto',
    padding: 20,
    gap: 14,
  },
});

export const FormCard = styled(Paper)({
  borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column',
  gap: 14, position: 'relative', overflow: 'visible',
  border: '1px solid #dde4ee', boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
});

export const AiPanel = styled(Box)(({ theme }) => ({
  width: '100%',
  flexShrink: 0,
  borderTop: '1px solid #dde4ee',
  background: '#f9fbff',
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
  [theme.breakpoints.up('md')]: {
    width: 320, minWidth: 280,
    borderTop: 'none',
    borderInlineStart: '1px solid #dde4ee',
    paddingBottom: 0,
  },
}));

export const SummarySectionCard = styled(Box)({
  background: '#fff', border: '1px solid #e2e8f2', borderRadius: 10,
  padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6,
});
