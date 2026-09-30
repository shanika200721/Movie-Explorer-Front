import { Stack, Typography } from '@mui/material';
import ContentState from '../components/ContentState';
import MovieGrid from '../components/MovieGrid';
import { useMovies } from '../state/AppProviders';

export default function FavoritesPage() {
  const { favorites } = useMovies();
  const movies = Object.values(favorites);
  return <Stack spacing={3}>
    <header><Typography variant="h4" component="h1" fontWeight={800}>Favorites</Typography>
      <Typography color="text.secondary">Your saved movies on this device.</Typography></header>
    <ContentState empty={!movies.length ? 'You have not saved any favorites yet.' : ''} />
    {movies.length > 0 && <MovieGrid movies={movies} />}
  </Stack>;
}
