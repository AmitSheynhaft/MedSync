export const pageHeaderRootSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1.5,
  px: { xs: 2, sm: 3 },
  py: 2,
  borderBottom: '1px solid #e9ecef',
  bgcolor: '#fff',
  flexShrink: 0,
};

export const pageHeaderTitleGroupSx = {
  flexDirection: 'row',
  alignItems: 'center',
  minWidth: 0,
};

export const pageHeaderTitleWrapSx = { minWidth: 0 };

export const pageHeaderTitleSx = { fontSize: 18, fontWeight: 700, color: '#1a1a2e' };
export const pageHeaderSubtitleSx = { fontSize: 13, color: '#868e96' };

export const pageHeaderDoctorGroupSx = {
  alignItems: 'center',
  flexShrink: 0,
  pl: { xs: 0, sm: 0.5 },
};

export const pageHeaderDoctorTextWrapSx = { maxWidth: { xs: 90, sm: 160 }, minWidth: 0, textAlign: 'end' };
export const pageHeaderDoctorNameSx = { fontSize: { xs: 12, sm: 14 }, fontWeight: 600, color: '#1a1a2e' };
export const pageHeaderDoctorSpecializationSx = { fontSize: { xs: 10.5, sm: 12 }, color: '#868e96' };

export const pageHeaderAvatarSx = {
  width: { xs: 32, sm: 36 },
  height: { xs: 32, sm: 36 },
  borderRadius: '50%',
  bgcolor: 'primary.main',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: { xs: 13, sm: 14 },
  flexShrink: 0,
};
