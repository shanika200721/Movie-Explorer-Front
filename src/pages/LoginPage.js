import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import api from '../api/client';
import { useAuth } from '../state/AppProviders';

export default function LoginPage() {
  const { token, login } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const path = isRegistering ? '/auth/register' : '/auth/login';
      const { data } = await api.post(path, form);
      login(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ width: 'min(420px, 100%)', p: 3 }}>
        <Stack spacing={2.2}>
          <Box>
            <Typography variant="h4" fontWeight={900}>Movie Explorer</Typography>
            <Typography color="text.secondary">Sign in to search TMDb movies.</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Username"
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            inputProps={{ minLength: 3 }}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            inputProps={{ minLength: 6 }}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={loading} size="large">
            {loading ? 'Please wait' : isRegistering ? 'Create account' : 'Login'}
          </Button>
          <Button onClick={() => setIsRegistering((value) => !value)}>
            {isRegistering ? 'Use existing account' : 'Create a new account'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
