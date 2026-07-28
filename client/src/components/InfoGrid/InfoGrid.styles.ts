export const infoGridRootSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
  gap: { xs: 1.5, sm: 2 },
  mb: { xs: 2.25, sm: 3 },
};

export const infoGridItemSx = {
  bgcolor: '#fff',
  border: '1px solid #e1e6ee',
  borderRadius: 3,
  p: { xs: 1.6, sm: 2 },
  boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
};

export const infoGridLabelSx = {
  fontSize: 12,
  color: '#98a2b3',
  fontWeight: 600,
  mb: 0.35,
};

export const infoGridValueSx = {
  fontSize: 15,
  color: '#1a1a2e',
  fontWeight: 700,
};
