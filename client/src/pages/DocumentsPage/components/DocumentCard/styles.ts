export const documentCardRootSx = {
  p: 2.5,
  borderRadius: 4,
  border: '1px solid #eef0f3',
  cursor: 'pointer',
  boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
  transition: 'all .18s',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(16,24,40,0.1)',
    transform: 'translateY(-2px)',
    borderColor: '#dfe3ea',
  },
};

export const documentCardBadgeWrapSx = { mb: 2.25 };

export const documentCardFileTypeChipSx = (color: string, bg: string) => ({
  fontWeight: 800,
  fontSize: 11,
  letterSpacing: '.04em',
  color,
  bgcolor: bg,
  borderRadius: 2,
});

export const documentCardFileNameSx = {
  fontSize: 16,
  fontWeight: 700,
  color: '#1a1a2e',
  mb: 0.75,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

export const documentCardMetaSx = {
  fontSize: 13,
  color: '#868e96',
  mb: 2,
};

export const documentCardStatusChipSx = (color: string, bg: string) => ({
  fontWeight: 800,
  fontSize: 11,
  letterSpacing: '.05em',
  color,
  bgcolor: bg,
  borderRadius: 2,
  '& .MuiChip-icon': { color },
});

export const documentCardStatusProgressSx = (color: string) => ({ color });
