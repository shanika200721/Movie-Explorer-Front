import { useCallback, useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import api, { apiErrorMessage } from '../api/client';
import ContentState from '../components/ContentState';
import MovieGrid from '../components/MovieGrid';

export default function HomePage() {
  const [state, setState] = useState({ movies: [], loading: true, error: '' });
  const load = useCallback(async (signal) => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const { data } = await api.get('/movies/trending', { params: { page: 1 }, signal });
      setState({ movies: data.results || [], loading: false, error: '' });
    } catch (error) {
      if (error.code !== 'ERR_CANCELED') setState({ movies: [], loading: false, error: apiErrorMessage(error, 'Trending movies could not be loaded.') });
    }
  }, []);
  useEffect(() => { const controller = new AbortController(); load(controller.signal); return () => controller.abort(); }, [load]);
  return <Stack spacing={3}>
    <header><Typography variant="h4" component="h1" fontWeight={800}>Trending this week</Typography>
      <Typography color="text.secondary">Movies people are watching now.</Typography></header>
    <ContentState loading={state.loading} error={state.error} empty={!state.loading && !state.error && !state.movies.length ? 'No trending movies are available.' : ''} onRetry={() => load()} />
    {state.movies.length > 0 && <MovieGrid movies={state.movies} />}
  </Stack>;
}
