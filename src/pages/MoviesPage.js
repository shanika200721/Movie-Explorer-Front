import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert, Box, Button, CircularProgress, FormControl, Grid, InputAdornment, InputLabel,
  MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import api from '../api/client';
import AppShell from '../components/AppShell';
import MovieCard from '../components/MovieCard';
import useFavorites from '../hooks/useFavorites';

const lastSearchKey = 'movieExplorerLastSearch';

export default function MoviesPage() {
  const initialSearch = localStorage.getItem(lastSearchKey) || '';
  const [query, setQuery] = useState(initialSearch);
  const [submittedQuery, setSubmittedQuery] = useState(initialSearch);
  const [filters, setFilters] = useState({ genre: '', year: '', rating: '' });
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState('results');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sentinel = useRef(null);
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    api.get('/movies/genres').then(({ data }) => setGenres(data.genres || [])).catch(() => {});
  }, []);

  const loadMovies = useCallback(async (nextPage, replace = false) => {
    setLoading(true);
    setError('');
    try {
      const searching = Boolean(submittedQuery);
      const { data } = await api.get(searching ? '/movies/search' : '/movies/trending', {
        params: searching ? { query: submittedQuery, page: nextPage, ...filters } : { page: nextPage },
      });
      setMovies((current) => replace ? data.results || [] : [...current, ...(data.results || [])]);
      setPage(nextPage);
      setTotalPages(Math.min(data.total_pages || 1, 500));
    } catch (err) {
      setError(err.response?.data?.message || 'Movies could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [filters, submittedQuery]);

  useEffect(() => { loadMovies(1, true); }, [loadMovies]);

  useEffect(() => {
    if (!sentinel.current || view !== 'results') return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading && page < totalPages) loadMovies(page + 1);
    }, { rootMargin: '300px' });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [loadMovies, loading, page, totalPages, view]);

  function handleSearch(event) {
    event.preventDefault();
    const value = query.trim();
    localStorage.setItem(lastSearchKey, value);
    setSubmittedQuery(value);
    setView('results');
  }

  const visibleMovies = useMemo(() => view === 'favorites' ? Object.values(favorites) : movies, [favorites, movies, view]);

  return (
    <AppShell>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={900}>{submittedQuery ? `Results for "${submittedQuery}"` : 'Trending this week'}</Typography>
          <Typography color="text.secondary">Discover a film, save favorites, and watch the trailer.</Typography>
        </Box>

        <Box component="form" onSubmit={handleSearch}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField fullWidth label="Search movies" value={query} onChange={(event) => setQuery(event.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            <Button type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ minWidth: 120 }}>Search</Button>
          </Stack>
        </Box>

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth><InputLabel>Genre</InputLabel><Select label="Genre" value={filters.genre}
              onChange={(event) => setFilters({ ...filters, genre: event.target.value })}>
              <MenuItem value="">All genres</MenuItem>
              {genres.map((genre) => <MenuItem key={genre.id} value={genre.id}>{genre.name}</MenuItem>)}
            </Select></FormControl>
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField fullWidth label="Release year" type="number" value={filters.year}
              inputProps={{ min: 1874, max: new Date().getFullYear() + 5 }}
              onChange={(event) => setFilters({ ...filters, year: event.target.value })} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <FormControl fullWidth><InputLabel>Minimum rating</InputLabel><Select label="Minimum rating" value={filters.rating}
              onChange={(event) => setFilters({ ...filters, rating: event.target.value })}>
              <MenuItem value="">Any rating</MenuItem>
              {[5, 6, 7, 8, 9].map((rating) => <MenuItem key={rating} value={rating}>{rating}+</MenuItem>)}
            </Select></FormControl>
          </Grid>
        </Grid>

        <ToggleButtonGroup exclusive value={view} onChange={(_, next) => next && setView(next)} size="small" aria-label="movie view">
          <ToggleButton value="results">Movies</ToggleButton>
          <ToggleButton value="favorites">Favorites ({Object.keys(favorites).length})</ToggleButton>
        </ToggleButtonGroup>

        {error && <Alert severity="error">{error}</Alert>}
        {!loading && visibleMovies.length === 0 && <Typography color="text.secondary">{view === 'favorites' ? 'No favorites saved yet.' : 'No movies matched your search.'}</Typography>}
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
          {visibleMovies.map((movie) => <Grid item xs={6} sm={4} md={3} lg={2.4} key={movie.id}>
            <MovieCard movie={movie} favorite={Boolean(favorites[movie.id])} onToggleFavorite={toggleFavorite} />
          </Grid>)}
        </Grid>

        {view === 'results' && <Box ref={sentinel} sx={{ minHeight: 48, display: 'grid', placeItems: 'center' }}>
          {loading ? <CircularProgress aria-label="loading movies" /> : page < totalPages &&
            <Button variant="outlined" onClick={() => loadMovies(page + 1)}>Load more</Button>}
        </Box>}
      </Stack>
    </AppShell>
  );
}
