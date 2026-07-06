import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Box, Tooltip, IconButton } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import { getEffectiveRole } from '../auth/viewAs';
import { logout } from '../api/authApi';
import { resetSessionVerification } from '../auth/verifySession';
import { useCurrentUser } from '../atoms/useCurrentUser';
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
  useCurrentUser();
  const role = getEffectiveRole();
  const isDoctor = role === 'doctor';
  const isAdmin  = role === 'admin';
  const isSecretary = role === 'secretary';
  const [showWelcomeSystemInfo, setShowWelcomeSystemInfo] = React.useState(consumeWelcomePending);

  return (
    <Box sx={rootSx}>
      {showWelcomeSystemInfo && (
        <SystemInfoModal role={role ?? undefined} onClose={() => setShowWelcomeSystemInfo(false)} />
      )}
      <Box component="main" sx={mainSx}>
        <Outlet />
      </Box>
      <Box component="aside" sx={asideSx}>
        <Box sx={logoSx}>
          M
        </Box>

        <Box sx={navGroupSx}>
          {isAdmin ? (
            <NavItem to="/admin" title="ניהול מערכת" icon={<AdminPanelSettingsIcon fontSize="small" />} />
          ) : isDoctor ? (
            <>
              <NavItem to="/patients"     title="מטופלים" icon={<PeopleIcon fontSize="small" />} />
              <NavItem to="/slots"        title="תורים"    icon={<EventIcon  fontSize="small" />} />
              <NavItem to="/profile"      title="פרופיל"  icon={<PersonIcon fontSize="small" />} />
            </>
          ) : isSecretary ? (
            <>
              <NavItem to="/schedule"             title="קביעת תור"    icon={<CalendarMonthIcon fontSize="small" />} />
              <NavItem to="/clinic-slots"         title="תורי המרפאה"   icon={<EventIcon         fontSize="small" />} />
              <NavItem to="/secretary-documents"  title="מסמכים"       icon={<DescriptionIcon   fontSize="small" />} />
              <NavItem to="/profile"              title="פרופיל"       icon={<PersonIcon        fontSize="small" />} />
            </>
          ) : (
            <>
              <NavItem to="/dashboard"       title="בית"      icon={<HomeIcon        fontSize="small" />} />
              <NavItem to="/my-slots"        title="התורים שלי" icon={<EventIcon       fontSize="small" />} />
              <NavItem to="/documents"       title="מסמכים"   icon={<DescriptionIcon fontSize="small" />} />
              <NavItem to="/profile"         title="פרופיל"   icon={<PersonIcon      fontSize="small" />} />
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
              onClick={() => { logout().finally(() => { resetSessionVerification(); navigate('/login'); }); }}
              sx={[logoutButtonSx, { display: { xs: (isDoctor || isSecretary) ? 'inline-flex' : 'none', md: 'inline-flex' } }] as SxProps<Theme>}
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


