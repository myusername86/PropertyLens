import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { AppRole } from '../store/roleStore';
import { useRoleStore } from '../store/roleStore';
import { surfaces } from '../theme';

interface RoleMeta {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const roleMeta: Record<AppRole, RoleMeta> = {
  Analyst: {
    label: 'Analyst',
    description: 'Create & analyze deals',
    icon: <TrendingUpIcon fontSize="small" />,
    color: '#60A5FA',
  },
  Investor: {
    label: 'Investor',
    description: 'Approve & reject deals',
    icon: <AssignmentIndIcon fontSize="small" />,
    color: '#14F0C8',
  },
  Admin: {
    label: 'Admin',
    description: 'Full access + billing',
    icon: <AdminPanelSettingsIcon fontSize="small" />,
    color: '#A78BFA',
  },
};

/**
 * Dev-only role simulator. Lets the demo switch between Analyst / Investor
 * / Admin and see RBAC take effect live in the UI — buttons and nav items
 * appear or disappear as the role's actual permissions change, and the
 * backend independently enforces the same rules on every request.
 */
export function RoleSwitcher() {
  const { role, setRole } = useRoleStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const meta = roleMeta[role];

  const handleSelect = (next: AppRole) => {
    setRole(next);
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Simulated role (dev only) — changes what you can do here and on the server">
        <Chip
          onClick={(e) => setAnchorEl(e.currentTarget)}
          icon={<Box sx={{ display: 'flex', color: meta.color, ml: '4px' }}>{meta.icon}</Box>}
          deleteIcon={<ExpandMoreIcon sx={{ color: 'text.secondary !important' }} />}
          onDelete={(e) => setAnchorEl(e.currentTarget as HTMLElement)}
          label={meta.label}
          sx={{
            backgroundColor: surfaces.glass,
            border: `1px solid ${meta.color}40`,
            color: meta.color,
            fontWeight: 700,
            cursor: 'pointer',
            '&:hover': { backgroundColor: `${meta.color}14` },
          }}
        />
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 240,
              backgroundColor: surfaces.sidebar,
              border: `1px solid ${surfaces.glassBorder}`,
              backgroundImage: 'none',
            },
          },
        }}
      >
        <Typography variant="overline" sx={{ px: 2, pt: 0.5, color: 'text.secondary', display: 'block' }}>
          Viewing as
        </Typography>
        {(Object.keys(roleMeta) as AppRole[]).map((key) => {
          const item = roleMeta[key];
          const selected = key === role;
          return (
            <MenuItem
              key={key}
              selected={selected}
              onClick={() => handleSelect(key)}
              sx={{
                borderRadius: 1.5,
                mx: 0.5,
                my: 0.25,
                '&.Mui-selected': { backgroundColor: `${item.color}1A` },
              }}
            >
              <ListItemIcon sx={{ color: item.color, minWidth: 34 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                slotProps={{
                  secondary: { sx: { color: 'text.secondary', fontSize: 12 } },
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
