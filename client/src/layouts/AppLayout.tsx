import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Box, Tooltip, IconButton } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import { clearSession, loadSession } from '../api/auth';
import SystemInfoModal from '../components/SystemInfoModal/SystemInfoModal';
import { consumeWelcomePending } from '../components/SystemInfoModal/welcomeFlag';
import {
  asideSx,
  logoSx,
  logoutButtonSx,
  utilityGroupSx,
  mainSx,
  navGroupSx,
  navItemSx,
  rootSx,
} from './AppLayout.styles';

const NavItem: React.FC<{ to: string; title: string; icon: React.ReactNode }> = ({ to, title, icon }) => {
  return (
    <Tooltip title={title} placement="left">
      <IconButton component={NavLink} to={to} sx={navItemSx}>
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const session = loadSession();
  const isDoctor = session?.role === 'doctor';
  const [showWelcomeSystemInfo, setShowWelcomeSystemInfo] = React.useState(consumeWelcomePending);

  return (
    <Box sx={rootSx}>
      {showWelcomeSystemInfo && (
        <SystemInfoModal role={session?.role} onClose={() => setShowWelcomeSystemInfo(false)} />
      )}
      <Box component="main" sx={mainSx}>
        <Outlet />
      </Box>
      <Box component="aside" sx={asideSx}>
        <Box sx={logoSx}>
          M
        </Box>

        <Box sx={navGroupSx}>
          {isDoctor ? (
            <NavItem to="/patients" title="מטופלים" icon={<PeopleIcon fontSize="small" />} />
          ) : (
            <>
              <NavItem to="/dashboard" title="בית"      icon={<HomeIcon        fontSize="small" />} />
              <NavItem to="/documents" title="מסמכים"   icon={<DescriptionIcon fontSize="small" />} />
              <NavItem to="/profile"   title="פרופיל"   icon={<PersonIcon      fontSize="small" />} />
            </>
          )}
        </Box>

        <Box sx={utilityGroupSx}>
          <Tooltip title="מדריך המערכת" placement="left">
            <IconButton onClick={() => setShowWelcomeSystemInfo(true)} sx={navItemSx}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="התנתק" placement="left">
            <IconButton
              onClick={() => { clearSession(); navigate('/login'); }}
              sx={[logoutButtonSx, { display: { xs: isDoctor ? 'inline-flex' : 'none', md: 'inline-flex' } }] as SxProps<Theme>}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;


