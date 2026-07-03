import type { SxProps, Theme } from '@mui/material';

export const navItemSx: SxProps<Theme> = {
  width: { xs: 44, md: 40 },
  height: { xs: 44, md: 40 },
  borderRadius: { xs: '12px', md: '10px' },
  color: '#adb5bd',
  '&:hover': { background: '#f1f3f5', color: '#495057' },
  '&.active': { background: '#eef2ff', color: '#3b5bdb' },
};

export const rootSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  height: '100dvh',
  minHeight: '100vh',
  overflow: 'hidden',
};

export const mainSx: SxProps<Theme> = {
  display: 'flex',
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
  pb: { xs: '72px', md: 0 },
};

export const asideSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'row', md: 'column' },
  alignItems: 'center',
  justifyContent: { xs: 'space-between', md: 'flex-start' },
  position: { xs: 'fixed', md: 'static' },
  left: { xs: 0, md: 'auto' },
  right: { xs: 0, md: 'auto' },
  bottom: { xs: 0, md: 'auto' },
  zIndex: 1200,
  width: { xs: '100%', md: 64 },
  height: { xs: 64, md: 'auto' },
  borderTop: { xs: '1px solid #e9ecef', md: 'none' },
  borderLeft: { xs: 'none', md: '1px solid #e9ecef' },
  py: { xs: 1, md: 2 },
  px: { xs: 1.5, md: 0 },
  flexShrink: 0,
  bgcolor: '#fff',
  boxShadow: { xs: '0 -6px 24px rgba(16,24,40,0.08)', md: 'none' },
};

export const logoSx: SxProps<Theme> = {
  width: 38,
  height: 38,
  bgcolor: 'primary.main',
  borderRadius: '10px',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 800,
  fontSize: 18,
  mb: 2,
  flexShrink: 0,
  display: { xs: 'none', md: 'flex' },
};

export const navGroupSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'row', md: 'column' },
  alignItems: 'center',
  justifyContent: { xs: 'space-evenly', md: 'flex-start' },
  gap: { xs: 1, md: 0.5 },
  flex: 1,
  minWidth: 0,
};

export const logoutWrapperSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: { xs: 1, md: 'none' },
  flexShrink: 0,
};

export const logoutButtonSx: SxProps<Theme> = {
  width: { xs: 44, md: 40 },
  height: { xs: 44, md: 40 },
  borderRadius: { xs: '12px', md: '10px' },
  color: '#adb5bd',
  '&:hover': { background: '#f1f3f5', color: '#495057' },
};
