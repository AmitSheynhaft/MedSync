export const documentsListRootSx = {
  p: 2,
  borderRadius: 3,
  border: '1px solid #e9ecef',
  bgcolor: '#fff',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 420,
  minHeight: 240,
} as const;

export const documentsListHeaderSx = {
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 1.5,
} as const;

export const documentsListTitleSx = {
  fontSize: 13,
  fontWeight: 800,
  color: '#384152',
  letterSpacing: '0.04em',
} as const;

export const documentsListUploadButtonSx = {
  fontSize: 12,
  fontWeight: 700,
  borderRadius: 999,
  px: 1.5,
} as const;

export const documentsListEmptySx = {
  color: '#868e96',
  fontSize: 14,
} as const;

export const documentsListScrollSx = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  pr: 0.5,
} as const;

export const documentRowSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  p: 1.5,
  border: '1px solid #dfe4ec',
  borderRadius: 3,
  bgcolor: '#fff',
  boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
} as const;

export const documentIconWrapSx = {
  width: 32,
  height: 32,
  borderRadius: '8px',
  bgcolor: '#f5f6f8',
  color: '#8b93a1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
} as const;

export const documentIconSx = {
  fontSize: 16,
} as const;

export const documentTextWrapSx = {
  flex: 1,
  minWidth: 0,
} as const;

export const documentNameSx = {
  fontSize: 13,
  fontWeight: 600,
  color: '#1a1a2e',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

export const documentMetaSx = {
  fontSize: 12,
  color: '#7b8494',
} as const;

export const documentActionSx = {
  color: '#868e96',
} as const;

export const documentInfoIconSx = {
  fontSize: 15,
} as const;

export const documentDownloadIconSx = {
  fontSize: 16,
} as const;
