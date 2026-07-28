export const listItemRowRootSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  px: 1.25,
  py: 0.75,
  background: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
};

export const listItemRowPrimarySx = (primaryColor: string) => ({
  fontWeight: 700,
  color: primaryColor,
  fontSize: 13,
  whiteSpace: 'nowrap',
});

export const listItemRowSecondarySx = {
  flex: 1,
  color: '#495057',
  fontSize: 13,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const listItemRowRemoveButtonSx = {
  minWidth: 0,
  p: 0.25,
  color: '#adb5bd',
  '&:hover': { color: '#e03131' },
};

export const listItemRowCloseIconSx = { fontSize: 16 };
