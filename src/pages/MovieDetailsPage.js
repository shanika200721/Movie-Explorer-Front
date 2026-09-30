import { useCallback, useEffect, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api, { apiErrorMessage } from '../api/client';
import ContentState from '../components/ContentState';
import { useMovies } from '../state/AppProviders';

const imageBase = 'https://image.tmdb.org/t/p/w780';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ movie: null, loading: true, error: '' });
  const { favorites, toggleFavorite } = useMovies();

  const load = useCallback(async (signal) => {
    setState({ movie: null, loading: true, error: '' });
    try {
      const { data } = await api.get(`/movies/${id}`, { signal });
      setState({ movie: data, loading: false, error: '' });
    } catch (error) {
      if (error.code !== 'ERR_CANCELED') setState({ movie: null, loading: false, error: apiErrorMessage(error, 'Movie details could not be loaded.') });
    }
  }, [id]);

  useEffect(() => { const controller = new AbortController(); load(controller.signal); return () => controller.abort(); }, [load]);
  const movie = state.movie;
  const rating = typeof movie?.voteAverage === 'number' ? movie.voteAverage.toFixed(1) : 'N/A';

  return <Stack spacing={3}>
    <Box><Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button></Box>
    <ContentState loading={state.loading} error={state.error} onRetry={() => load()} />
    {movie && <>
      <Grid container spacing={{ xs: 2.5, md: 4 }}>
        <Grid item xs={12} sm={4} md={3}>
          <Box component="img" src={movie.posterPath ? `${imageBase}${movie.posterPath}` : '/placeholder-poster.svg'}
            alt={movie.posterPath ? `${movie.title} poster` : `Poster unavailable for ${movie.title}`}
            sx={{ width: '100%', maxWidth: 360, borderRadius: 1, display: 'block' }} />
        </Grid>
        <Grid item xs={12} sm={8} md={9}>
          <Stack spacing={2} alignItems="flex-start">
            <Box><Typography variant="h3" component="h1" fontWeight={800} sx={{ overflowWrap: 'anywhere' }}>{movie.title}</Typography>
              <Typography color="text.secondary">{movie.releaseDate?.slice(0, 4) || 'Release date unavailable'}</Typography></Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{movie.genres.map((genre) => <Chip key={genre.id} label={genre.name} />)}</Stack>
            <Stack direction="row" spacing={0.7} alignItems="center"><StarIcon color="warning" />
              <Typography fontWeight={800}>{rating} / 10</Typography></Stack>
            <Typography sx={{ maxWidth: 800 }}>{movie.overview || 'No overview is available.'}</Typography>
            <Button variant="contained" color={favorites[movie.id] ? 'secondary' : 'primary'}
              startIcon={favorites[movie.id] ? <FavoriteIcon /> : <FavoriteBorderIcon />} onClick={() => toggleFavorite(movie)}>
              {favorites[movie.id] ? 'Remove favorite' : 'Add favorite'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <Box component="section" aria-labelledby="cast-heading">
        <Typography id="cast-heading" variant="h5" component="h2" fontWeight={800} gutterBottom>Cast</Typography>
        {movie.cast.length ? <Grid container spacing={2}>{movie.cast.map((person) => <Grid item xs={6} sm={4} md={3} key={`${person.id}-${person.character}`}>
          <Typography fontWeight={700}>{person.name}</Typography><Typography variant="body2" color="text.secondary">{person.character || 'Role unavailable'}</Typography>
        </Grid>)}</Grid> : <Typography color="text.secondary">Cast information is unavailable.</Typography>}
      </Box>
      <Box component="section" aria-labelledby="trailer-heading">
        <Typography id="trailer-heading" variant="h5" component="h2" fontWeight={800} gutterBottom>Trailer</Typography>
        {movie.trailer ? <Box className="video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(movie.trailer.key)}`}
          title={`${movie.title} trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></Box>
          : <Typography color="text.secondary">Trailer unavailable.</Typography>}
      </Box>
    </>}
  </Stack>;
}
