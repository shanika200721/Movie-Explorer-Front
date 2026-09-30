import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import { Card, CardActionArea, CardContent, CardMedia, IconButton, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const posterBase = 'https://image.tmdb.org/t/p/w500';

export default function MovieCard({ movie, favorite, onToggleFavorite }) {
  const navigate = useNavigate();
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';
  const poster = movie.poster_path ? `${posterBase}${movie.poster_path}` : '/placeholder-poster.svg';

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <IconButton
        aria-label={favorite ? 'remove from favorites' : 'add to favorites'}
        onClick={() => onToggleFavorite(movie)}
        sx={{ position: 'absolute', top: 6, right: 6, zIndex: 1, bgcolor: 'background.paper' }}
      >
        {favorite ? <FavoriteIcon color="secondary" /> : <FavoriteBorderIcon />}
      </IconButton>
      <CardActionArea onClick={() => navigate(`/movies/${movie.id}`)} sx={{ height: '100%' }}>
        <CardMedia component="img" image={poster} alt={`${movie.title} poster`} sx={{ aspectRatio: '2 / 3', objectFit: 'cover' }} />
        <CardContent>
          <Typography variant="subtitle1" fontWeight={800} noWrap title={movie.title}>
            {movie.title}
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">{year}</Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <StarIcon fontSize="small" color="warning" />
              <Typography variant="body2">{movie.vote_average?.toFixed?.(1) ?? '0.0'}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
