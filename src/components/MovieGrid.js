import { Grid } from '@mui/material';
import MovieCard from './MovieCard';
import { useMovies } from '../state/AppProviders';

export default function MovieGrid({ movies }) {
  const { favorites, toggleFavorite } = useMovies();
  return <Grid container spacing={{ xs: 1.5, sm: 2.5 }} component="section" aria-label="Movies">
    {movies.map((movie) => <Grid item xs={6} sm={4} md={3} lg={2.4} key={movie.id}>
      <MovieCard movie={movie} favorite={Boolean(favorites[movie.id])} onToggleFavorite={toggleFavorite} />
    </Grid>)}
  </Grid>;
}
