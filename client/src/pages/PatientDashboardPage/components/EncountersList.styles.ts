export const encountersListRootSx = {
  p: 2,
  borderRadius: 3,
  border: '1px solid #e9ecef',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 420,
  minHeight: 240,
} as const;

export const encountersListTitleSx = {
  fontSize: 13,
  fontWeight: 800,
  color: '#384152',
  mb: 1.25,
  letterSpacing: '0.04em',
} as const;

export const encountersListEmptySx = {
  color: '#868e96',
  fontSize: 14,
} as const;

export const encountersListScrollSx = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  pr: 0.5,
} as const;

export const encounterCardSx = {
  border: '1px solid #dfe4ec',
  borderRadius: 3,
  p: 1.75,
  bgcolor: '#fff',
  boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
  '&:hover': {
    borderColor: 'primary.main',
    boxShadow: '0 4px 12px rgba(59,91,219,0.1)',
  },
  transition: 'all 0.15s ease',
} as const;

export const encounterTopRowSx = {
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 0.5,
} as const;

export const encounterDoctorWrapSx = {
  alignItems: 'center',
} as const;

export const encounterIconWrapSx = (isPrimary: boolean) => ({
  width: 28,
  height: 28,
  borderRadius: '8px',
  bgcolor: isPrimary ? '#edf2ff' : '#f3f4f6',
  color: isPrimary ? 'primary.main' : '#8b93a1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const encounterIconSx = {
  fontSize: 14,
} as const;

export const encounterDoctorNameSx = {
  fontSize: 13,
  fontWeight: 600,
  color: '#1a1a2e',
} as const;

export const encounterDateWrapSx = {
  alignItems: 'center',
} as const;

export const encounterDateSx = {
  fontSize: 12,
  color: '#868e96',
} as const;

export const encounterChevronSx = {
  fontSize: 14,
  color: '#ced4da',
} as const;

export const encounterMetaSx = {
  fontSize: 12,
  color: '#7b8494',
} as const;
