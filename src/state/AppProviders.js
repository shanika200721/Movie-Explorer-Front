import { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const AuthContext = createContext(null);
const ThemeModeContext = createContext(null);

export function AppProviders({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('movieExplorerToken'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('movieExplorerUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [mode, setMode] = useState(() => localStorage.getItem('movieExplorerTheme') || 'light');

  const auth = useMemo(() => ({
    token,
    user,
    login(payload) {
      localStorage.setItem('movieExplorerToken', payload.accessToken);
      localStorage.setItem('movieExplorerUser', JSON.stringify(payload.user));
      setToken(payload.accessToken);
      setUser(payload.user);
    },
    logout() {
      localStorage.removeItem('movieExplorerToken');
      localStorage.removeItem('movieExplorerUser');
      setToken(null);
      setUser(null);
    },
  }), [token, user]);

  const themeMode = useMemo(() => ({
    mode,
    toggleMode() {
      setMode((current) => {
        const next = current === 'light' ? 'dark' : 'light';
        localStorage.setItem('movieExplorerTheme', next);
        return next;
      });
    },
  }), [mode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#0f766e' : '#5eead4' },
      secondary: { main: '#ef4444' },
      background: {
        default: mode === 'light' ? '#f7f8f5' : '#101418',
        paper: mode === 'light' ? '#ffffff' : '#172026',
      },
    },
    shape: { borderRadius: 8 },
    typography: { fontFamily: '"Inter", "Roboto", "Arial", sans-serif' },
  }), [mode]);

  return (
    <AuthContext.Provider value={auth}>
      <ThemeModeContext.Provider value={themeMode}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </ThemeModeContext.Provider>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const useThemeMode = () => useContext(ThemeModeContext);
