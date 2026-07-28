export const sectionHeaderRootSx = {
  alignItems: 'center',
  gap: 1,
  borderBottom: '1px solid #f1f3f5',
  pb: 1,
  mb: 0.5,
};

export const sectionHeaderIconWrapSx = (bg: string, color: string) => ({
  width: 30,
  height: 30,
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: bg,
  color,
  flexShrink: 0,
});

export const sectionHeaderLabelSx = (color: string) => ({
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color,
});
