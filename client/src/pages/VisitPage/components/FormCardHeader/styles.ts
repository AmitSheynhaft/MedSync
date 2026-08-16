export const formCardHeaderRootSx = { alignItems: 'center', gap: 1 };

export const formCardHeaderTitleSx = {
  fontSize: 11,
  fontWeight: 700,
  color: '#868e96',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  flex: 1,
};

export const formCardHeaderDraftChipSx = {
  fontSize: 11,
  fontWeight: 600,
  color: '#e8590c',
  background: '#fff3e6',
  border: 'none',
  height: 22,
};

export const formCardHeaderProcessingIconSx = { color: '#3b5bdb !important' };

export const formCardHeaderProcessingChipSx = {
  fontSize: 11,
  fontWeight: 600,
  color: '#3b5bdb',
  background: '#eef2ff',
  height: 22,
};

export const formCardHeaderRecordButtonSx = (isStarting: boolean, isRecording: boolean) => ({
  minWidth: 36,
  width: 36,
  height: 36,
  p: 0,
  borderRadius: '8px',
  borderColor: '#e9ecef',
  color: isRecording ? '#d9480f' : '#3b5bdb',
  '&:hover': { background: '#eef2ff', borderColor: '#3b5bdb' },
  ...(isStarting ? { background: '#eef2ff' } : {}),
  ...(isRecording ? { borderColor: '#ffa8a8', background: '#fff5f5' } : {}),
});

export const formCardHeaderRecordSpinnerSx = { color: '#3b5bdb' };
export const formCardHeaderRecordIconSx = { fontSize: 18 };

export const formCardHeaderRecordingIndicatorSx = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  px: 1.5,
  py: 0.5,
  borderRadius: '8px',
  background: '#fff5f5',
  border: '1px solid #ffa8a8',
};

export const formCardHeaderRecordingDotSx = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: '#e03131',
  flexShrink: 0,
  '@keyframes recordPulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.3 },
  },
  animation: 'recordPulse 1.2s ease-in-out infinite',
};

export const formCardHeaderAudioBarsContainerSx = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '2px',
  height: 16,
  '@keyframes barBounce': {
    '0%, 100%': { transform: 'scaleY(0.25)' },
    '50%': { transform: 'scaleY(1)' },
  },
  '& span': {
    display: 'block',
    width: 3,
    borderRadius: 2,
    background: '#e03131',
    transformOrigin: 'bottom',
    animation: 'barBounce 0.7s ease-in-out infinite',
  },
  '& span:nth-of-type(1)': { height: 16 },
  '& span:nth-of-type(2)': { height: 10 },
  '& span:nth-of-type(3)': { height: 14 },
  '& span:nth-of-type(4)': { height: 8 },
  '& span:nth-of-type(5)': { height: 12 },
};

export const formCardHeaderRecordingLabelSx = {
  fontSize: 11,
  fontWeight: 700,
  color: '#c92a2a',
  letterSpacing: '0.04em',
  lineHeight: 1,
};
