import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import { Card, CardActionArea, CardContent, CardMedia, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const posterBase = 'https://image.tmdb.org/t/p/w500';

export default function MovieCard({ movie, favorite, onToggleFavorite }) {
  const navigate = useNavigate();
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : 'Unknown';
  const poster = movie.posterPath ? `${posterBase}${movie.posterPath}` : '/placeholder-poster.svg';
  const rating = typeof movie.voteAverage === 'number' ? movie.voteAverage.toFixed(1) : 'N/A';
  return (
    <Card sx={{ height: '100%', position: 'relative', display: 'flex' }}>
      <Tooltip title={favorite ? 'Remove from favorites' : 'Add to favorites'}>
        <IconButton aria-label={favorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
          onClick={() => onToggleFavorite(movie)} sx={{ position: 'absolute', top: 6, right: 6, zIndex: 1, bgcolor: 'background.paper', boxShadow: 1 }}>
          {favorite ? <FavoriteIcon color="secondary" /> : <FavoriteBorderIcon />}
        </IconButton>
      </Tooltip>
      <CardActionArea onClick={() => navigate(`/movies/${movie.id}`)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardMedia component="img" image={poster} alt={movie.posterPath ? `${movie.title} poster` : `Poster unavailable for ${movie.title}`}
          sx={{ aspectRatio: '2 / 3', objectFit: 'cover' }} />
        <CardContent sx={{ width: '100%', mt: 'auto' }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ overflowWrap: 'anywhere' }}>{movie.title}</Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5}>
            <Typography variant="body2" color="text.secondary">{year}</Typography>
            <Stack direction="row" spacing={0.5} alignItems="center"><StarIcon fontSize="small" color="warning" />
              <Typography variant="body2" aria-label={`Rating ${rating} out of 10`}>{rating}</Typography></Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
