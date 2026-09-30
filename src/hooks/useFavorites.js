import { useEffect, useState } from 'react';

const storageKey = 'movieExplorerFavorites';

export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
    catch { return {}; }
  });

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(favorites)); }, [favorites]);

  function toggleFavorite(movie) {
    setFavorites((current) => {
      const next = { ...current };
      if (next[movie.id]) delete next[movie.id];
      else next[movie.id] = movie;
      return next;
    });
  }

  return { favorites, toggleFavorite };
}
