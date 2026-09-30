import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Box, Button, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, useThemeMode } from '../state/AppProviders';

const links = [['/', 'Home'], ['/search', 'Search'], ['/browse', 'Browse'], ['/favorites', 'Favorites']];

export default function AppShell() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  return (
    <Box>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 1, flexWrap: { xs: 'wrap', md: 'nowrap' }, py: { xs: 1, md: 0 } }}>
          <Typography variant="h6" component={NavLink} to="/" color="inherit" sx={{ fontWeight: 800, textDecoration: 'none', mr: 2 }}>
            Movie Explorer
          </Typography>
          <Stack component="nav" aria-label="Main navigation" direction="row" spacing={0.5}
            sx={{ order: { xs: 3, md: 0 }, width: { xs: '100%', md: 'auto' }, overflowX: 'auto' }}>
            {links.map(([to, label]) => <Button key={to} component={NavLink} to={to} end={to === '/'} color="inherit"
              sx={{ '&.active': { color: 'primary.main', bgcolor: 'action.selected' } }}>{label}</Button>)}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>{user?.username}</Typography>
          <Tooltip title={mode === 'light' ? 'Use dark mode' : 'Use light mode'}>
            <IconButton aria-label={mode === 'light' ? 'use dark mode' : 'use light mode'} onClick={toggleMode}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Log out">
            <IconButton aria-label="log out" onClick={() => { logout(); navigate('/login'); }}><LogoutIcon /></IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ width: 'min(1180px, 100%)', mx: 'auto', p: { xs: 2, sm: 3 } }}><Outlet /></Box>
    </Box>
  );
}
