import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth, useThemeMode } from '../state/AppProviders';

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { mode, toggleMode } = useThemeMode();

  return (
    <Box>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/')}>
            Movie Explorer
          </Typography>
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.username}
          </Typography>
          <IconButton aria-label="toggle color mode" onClick={toggleMode}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <Button startIcon={<LogoutIcon />} onClick={logout} color="inherit">
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ width: 'min(1180px, 100%)', mx: 'auto', p: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
    </Box>
  );
}
