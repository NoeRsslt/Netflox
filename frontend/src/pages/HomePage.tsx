import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import MovieCard from "../components/MovieCard";
import { fetchMovies } from "../services/api";
import type { Movie } from "../types/movie";
import "./HomePage.css";

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies()
      .then(setMovies)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [movies, search]);

  return (
    <div className="home-page">
      <Header onSearch={setSearch} />
      <main className="home-page__content">
        {loading && <p className="home-page__message">Chargement...</p>}
        {error && <p className="home-page__message">{error}</p>}
        {!loading && !error && filteredMovies.length === 0 && (
          <p className="home-page__message">Aucun film trouvé.</p>
        )}
        <div className="home-page__grid">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </main>
    </div>
  );
}
