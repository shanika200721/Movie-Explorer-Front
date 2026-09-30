import { useEffect, useMemo, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import InfiniteMovieResults from '../components/InfiniteMovieResults';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../state/AppProviders';
import { readTextStorage, writeTextStorage } from '../utils/storage';

export default function SearchPage() {
  const { user } = useAuth();
  const storageKey = `movieExplorerLastSearch:${user.id}`;
  const [query, setQuery] = useState(() => readTextStorage(storageKey));
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = query.trim();
      setDebouncedQuery(next);
      writeTextStorage(storageKey, next);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, storageKey]);

  const params = useMemo(() => ({ query: debouncedQuery }), [debouncedQuery]);
  return <Stack spacing={3}>
    <header><Typography variant="h4" component="h1" fontWeight={800}>Search movies</Typography>
      <Typography color="text.secondary">Search by movie title.</Typography></header>
    <SearchBar value={query} onChange={setQuery} />
    <InfiniteMovieResults endpoint="/movies/search" params={params} enabled={Boolean(debouncedQuery)}
      emptyMessage={debouncedQuery ? `No movies found for “${debouncedQuery}”.` : 'Enter a movie title to begin searching.'} />
  </Stack>;
}
