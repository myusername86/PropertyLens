import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';

const DRAWER_WIDTH = 232;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Deal pipeline', path: '/deals', icon: <ViewKanbanIcon /> },
  { label: 'New deal', path: '/deals/new', icon: <AddHomeWorkIcon /> },
];

export function AppLayout() {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
          backgroundColor: 'primary.dark',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleSidebar} sx={{ mr: 2 }} aria-label="Toggle navigation">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: 0.5 }}>
            PropertyLens
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid #E4E7E4' },
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
              sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
