import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { setApiAuth } from '../api/client';
import { readStorage, readTextStorage, writeStorage, writeTextStorage } from '../utils/storage';

const AuthContext = createContext(null);
const ThemeModeContext = createContext(null);
const MovieContext = createContext(null);

export function AppProviders({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authNotice, setAuthNotice] = useState('');
  const [mode, setMode] = useState(() => {
    const stored = readTextStorage('movieExplorerTheme', 'light');
    return stored === 'dark' ? 'dark' : 'light';
  });

  const logout = useCallback((notice = '') => {
    setApiAuth(null, null);
    setToken(null);
    setUser(null);
    setAuthNotice(notice);
  }, []);

  useEffect(() => {
    setApiAuth(token, () => logout('Your session expired. Please sign in again.'));
    return () => setApiAuth(null, null);
  }, [logout, token]);

  const auth = useMemo(() => ({
    token,
    user,
    authNotice,
    login(payload) {
      setApiAuth(payload.accessToken, () => logout('Your session expired. Please sign in again.'));
      setToken(payload.accessToken);
      setUser(payload.user);
      setAuthNotice('');
    },
    logout,
    clearAuthNotice: () => setAuthNotice(''),
  }), [authNotice, logout, token, user]);

  const themeMode = useMemo(() => ({
    mode,
    toggleMode() {
      setMode((current) => {
        const next = current === 'light' ? 'dark' : 'light';
        writeTextStorage('movieExplorerTheme', next);
        return next;
      });
    },
  }), [mode]);

  const favoritesKey = user ? `movieExplorerFavorites:${user.id}` : null;
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    const stored = favoritesKey ? readStorage(favoritesKey, {}) : {};
    setFavorites(stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {});
  }, [favoritesKey]);

  const movies = useMemo(() => ({
    favorites,
    toggleFavorite(movie) {
      if (!favoritesKey) return;
      setFavorites((current) => {
        const next = { ...current };
        if (next[movie.id]) delete next[movie.id];
        else next[movie.id] = movie;
        writeStorage(favoritesKey, next);
        return next;
      });
    },
  }), [favorites, favoritesKey]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#00695c' : '#80cbc4' },
      secondary: { main: mode === 'light' ? '#c62828' : '#ef9a9a' },
      background: { default: mode === 'light' ? '#f4f6f5' : '#121615', paper: mode === 'light' ? '#fff' : '#1c2321' },
    },
    shape: { borderRadius: 8 },
    typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif', h1: { letterSpacing: 0 }, h2: { letterSpacing: 0 } },
    components: {
      MuiButtonBase: { styleOverrides: { root: { '&:focus-visible': { outline: '3px solid #ffb300', outlineOffset: 2 } } } },
    },
  }), [mode]);

  return (
    <AuthContext.Provider value={auth}>
      <MovieContext.Provider value={movies}>
        <ThemeModeContext.Provider value={themeMode}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeModeContext.Provider>
      </MovieContext.Provider>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const useMovies = () => useContext(MovieContext);
export const useThemeMode = () => useContext(ThemeModeContext);
