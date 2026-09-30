import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function AuthForm({ title, subtitle, submitLabel, alternateText, alternateLabel, alternateTo, form, setForm, error, notice, loading, onSubmit }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper component="form" onSubmit={onSubmit} sx={{ width: 'min(420px, 100%)', p: { xs: 2.5, sm: 4 } }}>
        <Stack spacing={2.25}>
          <Box><Typography variant="h4" component="h1" fontWeight={800}>Movie Explorer</Typography>
            <Typography variant="h6" component="h2" mt={1}>{title}</Typography>
            <Typography color="text.secondary">{subtitle}</Typography></Box>
          {notice && <Alert severity="info">{notice}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Username" autoComplete="username" value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            inputProps={{ minLength: 3, maxLength: 80, pattern: '[A-Za-z0-9_]+' }} helperText="Letters, numbers, and underscores" required fullWidth />
          <TextField label="Password" type="password" autoComplete={submitLabel === 'Create account' ? 'new-password' : 'current-password'}
            value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })}
            inputProps={{ minLength: 8, maxLength: 128 }} required fullWidth />
          <Button type="submit" variant="contained" disabled={loading} size="large">{loading ? 'Please wait...' : submitLabel}</Button>
          <Typography variant="body2" textAlign="center">{alternateText}{' '}
            <Button component={Link} to={alternateTo} size="small">{alternateLabel}</Button></Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
