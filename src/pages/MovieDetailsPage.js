import { useEffect, useMemo, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import { Alert, Box, Button, Chip, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import AppShell from '../components/AppShell';
import useFavorites from '../hooks/useFavorites';

const imageBase = 'https://image.tmdb.org/t/p/w780';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    setError('');
    api.get(`/movies/${id}`).then(({ data }) => setMovie(data))
      .catch((err) => setError(err.response?.data?.message || 'Movie details could not be loaded.'));
  }, [id]);

  const trailer = useMemo(() => movie?.videos?.results?.find((video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official)
    || movie?.videos?.results?.find((video) => video.site === 'YouTube' && video.type === 'Trailer'), [movie]);

  return (
    <AppShell>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
      {error && <Alert severity="error">{error}</Alert>}
      {!movie && !error && <Box sx={{ minHeight: 300, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>}
      {movie && <Stack spacing={4}>
        <Grid container spacing={{ xs: 2.5, md: 4 }}>
          <Grid item xs={12} sm={4} md={3}>
            <Box component="img" src={movie.poster_path ? `${imageBase}${movie.poster_path}` : '/placeholder-poster.svg'}
              alt={`${movie.title} poster`} sx={{ width: '100%', maxWidth: 360, borderRadius: 1, display: 'block' }} />
          </Grid>
          <Grid item xs={12} sm={8} md={9}>
            <Stack spacing={2} alignItems="flex-start">
              <Box>
                <Typography variant="h3" component="h1" fontWeight={900}>{movie.title}</Typography>
                <Typography color="text.secondary">{movie.release_date?.slice(0, 4) || 'Release date unavailable'}</Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {movie.genres?.map((genre) => <Chip key={genre.id} label={genre.name} />)}
              </Stack>
              <Stack direction="row" spacing={0.7} alignItems="center"><StarIcon color="warning" /><Typography fontWeight={800}>{movie.vote_average?.toFixed(1)} / 10</Typography></Stack>
              <Typography sx={{ maxWidth: 800 }}>{movie.overview || 'No overview is available.'}</Typography>
              <Button variant="contained" color={favorites[movie.id] ? 'secondary' : 'primary'}
                startIcon={favorites[movie.id] ? <FavoriteIcon /> : <FavoriteBorderIcon />} onClick={() => toggleFavorite(movie)}>
                {favorites[movie.id] ? 'Remove favorite' : 'Add favorite'}
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Box>
          <Typography variant="h5" component="h2" fontWeight={800} gutterBottom>Cast</Typography>
          <Grid container spacing={1.5}>
            {movie.credits?.cast?.slice(0, 8).map((person) => <Grid item xs={6} sm={4} md={3} key={`${person.id}-${person.character}`}>
              <Typography fontWeight={700}>{person.name}</Typography><Typography variant="body2" color="text.secondary">{person.character}</Typography>
            </Grid>)}
          </Grid>
        </Box>

        <Box>
          <Typography variant="h5" component="h2" fontWeight={800} gutterBottom>Trailer</Typography>
          {trailer ? <Box className="video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
            title={`${movie.title} trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></Box>
            : <Typography color="text.secondary">No trailer is available.</Typography>}
        </Box>
      </Stack>}
    </AppShell>
  );
}
