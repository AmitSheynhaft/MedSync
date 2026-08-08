export const documentsGridEmptyTextSx = {
  textAlign: 'center',
  color: '#868e96',
  fontSize: 14,
  py: 8,
};

export const documentsGridScrollSx = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  pr: 0.5,
};

export const documentsGridRootSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(280px, 1fr))' },
  gap: 2.5,
};
