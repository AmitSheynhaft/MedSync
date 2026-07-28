export const processingOverlayRootSx = {
  position: 'absolute',
  inset: 0,
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(3px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1.5,
  zIndex: 10,
};

export const processingOverlayTextSx = {
  fontSize: 15,
  fontWeight: 600,
  color: '#3b5bdb',
};
