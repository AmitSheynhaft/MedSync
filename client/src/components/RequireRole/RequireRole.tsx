import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { verifySession, RoleMismatchError } from '../../auth/verifySession';
import { clearUserDataSession } from '../../auth/userDataSessionStore';
import {
  getEffectiveRole,
  getViewAs,
  homeForRole,
  isRoleViewTampered,
  subscribeViewAs,
} from '../../auth/viewAs';
import type { RoleName } from '../../auth/types';
import { useCurrentUser } from '../../atoms/useCurrentUser';
import { RoleMismatchDialog } from '../RoleMismatchDialog/RoleMismatchDialog';

export interface IRequireRoleProps {
  allow?: RoleName[];
}

export const RequireRole: React.FC<IRequireRoleProps> = ({ allow }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  // Re-render whenever the "view as" role changes so route access is re-checked
  // immediately, without waiting for a navigation event.
  useSyncExternalStore(subscribeViewAs, getViewAs, () => null);
  // Gate rendering only on the first verification; later navigations re-verify
  // in the background so the page subtree isn't unmounted and refetched.
  const [hasVerifiedOnce, setHasVerifiedOnce] = useState(false);
  const [isRoleTampered, setIsRoleTampered] = useState(false);

  useEffect(() => {
    let active = true;
    verifySession()
      .then(() => {
        if (active) setHasVerifiedOnce(true);
      })
      .catch(error => {
        if (!active) return;
        if (error instanceof RoleMismatchError) {
          setIsRoleTampered(true);
        }
        setHasVerifiedOnce(true);
      });
    return () => { active = false; };
  }, [location.pathname]);

  const handleConfirmRelogin = () => {
    clearUserDataSession();
    setIsRoleTampered(false);
    navigate('/login', { replace: true });
  };

  if (isRoleTampered || isRoleViewTampered()) {
    return <RoleMismatchDialog open onConfirm={handleConfirmRelogin} mode="tamper" />;
  }

  if (!hasVerifiedOnce) return null;

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const effectiveRole = getEffectiveRole() ?? currentUser.role;

  if (allow && !allow.includes(effectiveRole)) {
    return (
      <RoleMismatchDialog
        open
        mode="route"
        onConfirm={() => navigate(homeForRole(effectiveRole), { replace: true })}
      />
    );
  }

  return <Outlet />;
};

export default RequireRole;
