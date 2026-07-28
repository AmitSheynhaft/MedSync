export const documentsHeaderRootSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1.5,
  px: { xs: 2, sm: 4 },
  minHeight: 72,
  bgcolor: '#fff',
  borderBottom: '1px solid #e9ecef',
  flexShrink: 0,
};

export const documentsHeaderTitleWrapSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  minWidth: 0,
};

export const documentsHeaderTitleSx = {
  fontSize: { xs: 18, sm: 22 },
  fontWeight: 800,
  color: '#1a1a2e',
};

export const documentsHeaderUploadButtonSx = {
  borderRadius: 3,
  px: { xs: 2, sm: 2.5 },
  py: 1.2,
  fontWeight: 700,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  '& .MuiButton-startIcon': { ml: 1, mr: 0 },
};
