import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const RecordingBanner = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 20px',
  background: 'linear-gradient(90deg, #0d1117 0%, #0f1f0f 100%)',
  flexShrink: 0,
  borderBottom: '1px solid #1db95440',
});

export const AudioBarsContainer = styled(Box)({
  display: 'flex',
  alignItems: 'flex-end',
  gap: 3,
  height: 22,
  '@keyframes barBounce': {
    '0%, 100%': { transform: 'scaleY(0.25)' },
    '50%': { transform: 'scaleY(1)' },
  },
  '& span': {
    display: 'block',
    width: 4,
    borderRadius: 3,
    background: '#1db954',
    transformOrigin: 'bottom',
    animation: 'barBounce 0.7s ease-in-out infinite',
  },
  '& span:nth-of-type(1)': { height: 22, animationDelay: '0s' },
  '& span:nth-of-type(2)': { height: 14, animationDelay: '0.12s' },
  '& span:nth-of-type(3)': { height: 20, animationDelay: '0.24s' },
  '& span:nth-of-type(4)': { height: 10, animationDelay: '0.08s' },
  '& span:nth-of-type(5)': { height: 17, animationDelay: '0.18s' },
});

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
