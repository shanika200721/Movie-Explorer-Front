import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';

export default function ContentState({ loading, error, empty, onRetry }) {
  if (loading) return <Box role="status" sx={{ minHeight: 160, display: 'grid', placeItems: 'center' }}><CircularProgress aria-label="Loading movies" /></Box>;
  if (error) return <Alert severity="error" action={onRetry && <Button color="inherit" onClick={onRetry}>Retry</Button>}>{error}</Alert>;
  if (empty) return <Typography color="text.secondary" role="status">{empty}</Typography>;
  return null;
}
