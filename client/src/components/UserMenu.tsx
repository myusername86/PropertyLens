import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../features/auth/hooks';
import { useAuthStore } from '../store/authStore';
import { accent, surfaces } from '../theme';

/** Shows the signed-in user's initials, name, and role; provides Logout. */
export function UserMenu() {
  const { displayName, role } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const logout = useLogout();
  const navigate = useNavigate();

  const initials = (displayName ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    setAnchorEl(null);
    logout.mutate(undefined, {
      onSettled: () => navigate('/login', { replace: true }),
    });
  };

  return (
    <>
      <Avatar
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          width: 34,
          height: 34,
          bgcolor: surfaces.glass,
          color: accent,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          border: `1px solid ${surfaces.glassBorder}`,
        }}
      >
        {initials}
      </Avatar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 220,
              backgroundColor: surfaces.sidebar,
              border: `1px solid ${surfaces.glassBorder}`,
              backgroundImage: 'none',
            },
          },
        }}
      >
        <ListItemText
          sx={{ px: 2, py: 0.5 }}
          primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{displayName}</Typography>}
          secondary={
            <Typography variant="caption" color="text.secondary">
              {role}
            </Typography>
          }
        />
        <Divider sx={{ my: 0.5 }} />
        <MenuItem disabled>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Account settings" secondary="Coming soon" />
        </MenuItem>
        <MenuItem onClick={handleLogout} disabled={logout.isPending}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: '#F87171' }} />
          </ListItemIcon>
          <ListItemText primary={logout.isPending ? 'Signing out…' : 'Sign out'} />
        </MenuItem>
      </Menu>
    </>
  );
}
