export const documentsToolbarRootSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  mb: 3.5,
  flexWrap: 'wrap',
};

export const documentsToolbarFilterScrollerSx = {
  width: { xs: '100%', sm: 'auto' },
  overflowX: 'auto',
  overflowY: 'hidden',
  scrollbarWidth: 'thin',
  WebkitOverflowScrolling: 'touch',
};

export const documentsToolbarFilterStackSx = {
  gap: 1.5,
  flexWrap: 'nowrap',
  width: 'max-content',
  py: 0.25,
};

export const documentsToolbarFilterChipSx = (isActive: boolean) => ({
  borderRadius: 999,
  fontWeight: 600,
  fontSize: 13,
  px: 1.5,
  height: 38,
  bgcolor: isActive ? undefined : '#fff',
  flexShrink: 0,
});
