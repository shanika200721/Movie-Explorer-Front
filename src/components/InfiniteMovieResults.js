import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import api, { apiErrorMessage } from '../api/client';
import ContentState from './ContentState';
import MovieGrid from './MovieGrid';

export default function InfiniteMovieResults({ endpoint, params, enabled = true, emptyMessage }) {
  const paramsKey = JSON.stringify(params);
  const [state, setState] = useState({ movies: [], page: 0, totalPages: 1, loading: false, error: '' });
  const generation = useRef(0);
  const requestedPages = useRef(new Set());
  const controller = useRef(null);
  const sentinel = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const loadPage = useCallback(async (nextPage) => {
    if (!enabled || requestedPages.current.has(nextPage)) return;
    requestedPages.current.add(nextPage);
    const requestGeneration = generation.current;
    const requestController = new AbortController();
    controller.current = requestController;
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const { data } = await api.get(endpoint, { params: { ...JSON.parse(paramsKey), page: nextPage }, signal: requestController.signal });
      if (generation.current !== requestGeneration) return;
      setState((current) => {
        const merged = nextPage === 1 ? data.results || [] : [...current.movies, ...(data.results || [])];
        return {
          movies: [...new Map(merged.map((movie) => [movie.id, movie])).values()],
          page: data.page ?? nextPage,
          totalPages: Math.min(data.totalPages ?? 0, 500),
          loading: false,
          error: '',
        };
      });
    } catch (error) {
      if (generation.current !== requestGeneration || error.code === 'ERR_CANCELED') return;
      requestedPages.current.delete(nextPage);
      setState((current) => ({ ...current, loading: false, error: apiErrorMessage(error, 'Movies could not be loaded.') }));
    }
  }, [enabled, endpoint, paramsKey]);

  useEffect(() => {
    generation.current += 1;
    controller.current?.abort();
    requestedPages.current = new Set();
    setState({ movies: [], page: 0, totalPages: 1, loading: false, error: '' });
    if (enabled) loadPage(1);
    return () => controller.current?.abort();
  }, [enabled, loadPage]);

  useEffect(() => {
    if (!enabled || !sentinel.current || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      const current = stateRef.current;
      if (entry.isIntersecting && !current.loading && current.page < current.totalPages) loadPage(current.page + 1);
    }, { rootMargin: '240px' });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [enabled, loadPage]);

  if (!enabled) return <ContentState empty={emptyMessage} />;
  return <Box>
    <ContentState loading={state.loading && state.movies.length === 0} error={state.error && state.movies.length === 0 ? state.error : ''}
      empty={!state.loading && !state.error && state.movies.length === 0 ? emptyMessage : ''} onRetry={() => loadPage(state.page || 1)} />
    {state.movies.length > 0 && <MovieGrid movies={state.movies} />}
    {state.error && state.movies.length > 0 && <Box mt={2}><ContentState error={state.error} onRetry={() => loadPage(state.page + 1)} /></Box>}
    <Box ref={sentinel} sx={{ minHeight: 72, display: 'grid', placeItems: 'center', mt: 2 }}>
      {state.loading && state.movies.length > 0 && <CircularProgress size={30} aria-label="Loading more movies" />}
      {!state.loading && !state.error && state.page < state.totalPages &&
        <Button variant="outlined" onClick={() => loadPage(state.page + 1)}>Load more</Button>}
    </Box>
  </Box>;
}
