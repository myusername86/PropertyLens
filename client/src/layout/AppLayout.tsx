import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import InsightsIcon from '@mui/icons-material/Insights';
import MapIcon from '@mui/icons-material/Map';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { RiskLevel } from '../api/types';
import { useDeals } from '../features/deals/hooks';
import { useUiStore } from '../store/uiStore';
import { accent, surfaces } from '../theme';

const DRAWER_WIDTH = 236;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Deal pipeline', path: '/deals', icon: <ViewKanbanIcon /> },
  { label: 'New deal', path: '/deals/new', icon: <AddHomeWorkIcon />, highlight: true },
];

/** Honest roadmap items — visible but explicitly not built yet. */
const upcomingItems = [
  { label: 'Analytics', icon: <InsightsIcon /> },
  { label: 'Portfolio map', icon: <MapIcon /> },
];

export function AppLayout() {
  const { sidebarOpen, toggleSidebar, searchQuery, setSearchQuery } = useUiStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: deals } = useDeals();

  const highRiskCount = (deals ?? []).filter(
    (deal) => deal.riskLevel === RiskLevel.High,
  ).length;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim() !== '' && location.pathname !== '/deals') {
      navigate('/deals');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Box className="aurora aurora-teal" aria-hidden />
      <Box className="aurora aurora-violet" aria-hidden />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
          backgroundColor: 'rgba(10, 20, 40, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${surfaces.glassBorder}`,
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton color="inherit" edge="start" onClick={toggleSidebar} aria-label="Toggle navigation">
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: 0.5, color: accent }}
          >
            PropertyLens
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <TextField
              size="small"
              placeholder="Search deals or properties…"
              value={searchQuery}
              onChange={(event) => handleSearch(event.target.value)}
              sx={{
                width: { xs: '100%', sm: 380 },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: surfaces.glass,
                  borderRadius: 99,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Tooltip
            title={
              highRiskCount > 0
                ? `${highRiskCount} high-risk ${highRiskCount === 1 ? 'deal' : 'deals'} in your pipeline`
                : 'No high-risk deals'
            }
          >
            <IconButton color="inherit" component={Link} to="/deals" aria-label="Risk alerts">
              <Badge badgeContent={highRiskCount} color="error">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Avatar sx={{ width: 34, height: 34, bgcolor: surfaces.glass, color: accent, fontSize: 14, fontWeight: 700 }}>
            DU
          </Avatar>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: surfaces.sidebar,
            borderRight: `1px solid ${surfaces.glassBorder}`,
          },
        }}
      >
        <Toolbar />
        <List sx={{ pt: 2 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                mx: 1.5,
                borderRadius: 3,
                mb: 0.5,
                color: item.highlight ? accent : 'text.secondary',
                '& .MuiListItemIcon-root': { color: item.highlight ? accent : 'text.secondary' },
                '&:hover': { backgroundColor: surfaces.glass },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(20, 240, 200, 0.12)',
                  color: accent,
                  '& .MuiListItemIcon-root': { color: accent },
                  '&:hover': { backgroundColor: 'rgba(20, 240, 200, 0.18)' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}

          {upcomingItems.map((item) => (
            <ListItemButton key={item.label} disabled sx={{ mx: 1.5, borderRadius: 3, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              <Chip label="Soon" size="small" sx={{ height: 20, fontSize: 11 }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0, position: 'relative', zIndex: 1 }}>
        <Toolbar />
        <Box key={location.pathname} className="page-fade">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
