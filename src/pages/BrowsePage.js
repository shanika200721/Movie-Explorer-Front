import { useEffect, useMemo, useState } from 'react';
import { Alert, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import api, { apiErrorMessage } from '../api/client';
import InfiniteMovieResults from '../components/InfiniteMovieResults';

export default function BrowsePage() {
  const [filters, setFilters] = useState({ genre: '', year: '', minRating: '' });
  const [genres, setGenres] = useState([]);
  const [genreError, setGenreError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    api.get('/movies/genres', { signal: controller.signal }).then(({ data }) => setGenres(data.genres || []))
      .catch((error) => { if (error.code !== 'ERR_CANCELED') setGenreError(apiErrorMessage(error, 'Genres could not be loaded.')); });
    return () => controller.abort();
  }, []);
  const params = useMemo(() => ({
    ...(filters.genre !== '' && { genre: filters.genre }),
    ...(filters.year !== '' && { year: filters.year }),
    ...(filters.minRating !== '' && { minRating: filters.minRating }),
  }), [filters]);
  const update = (name) => (event) => setFilters((current) => ({ ...current, [name]: event.target.value }));
  return <Stack spacing={3}>
    <header><Typography variant="h4" component="h1" fontWeight={800}>Browse movies</Typography>
      <Typography color="text.secondary">Explore TMDb results by genre, release year, and minimum rating.</Typography></header>
    {genreError && <Alert severity="warning">{genreError}</Alert>}
    <Grid container spacing={2} component="section" aria-label="Movie filters">
      <Grid item xs={12} sm={4}><FormControl fullWidth><InputLabel id="genre-label">Genre</InputLabel>
        <Select labelId="genre-label" label="Genre" value={filters.genre} onChange={update('genre')}>
          <MenuItem value="">All genres</MenuItem>{genres.map((genre) => <MenuItem key={genre.id} value={genre.id}>{genre.name}</MenuItem>)}
        </Select></FormControl></Grid>
      <Grid item xs={6} sm={4}><TextField fullWidth label="Release year" type="number" value={filters.year} onChange={update('year')}
        inputProps={{ min: 1000, max: 9999 }} /></Grid>
      <Grid item xs={6} sm={4}><FormControl fullWidth><InputLabel id="rating-label">Minimum rating</InputLabel>
        <Select labelId="rating-label" label="Minimum rating" value={filters.minRating} onChange={update('minRating')}>
          <MenuItem value="">Any rating</MenuItem>{[0, 5, 6, 7, 8, 9].map((rating) => <MenuItem key={rating} value={rating}>{rating}+</MenuItem>)}
        </Select></FormControl></Grid>
    </Grid>
    <InfiniteMovieResults endpoint="/movies/discover" params={params} emptyMessage="No movies match these filters." />
  </Stack>;
}
