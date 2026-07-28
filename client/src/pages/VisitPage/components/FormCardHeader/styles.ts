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
