import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMovieById, getPosterUrl } from "../services/api";
import type { Movie } from "../types/movie";
import "./MoviePage.css";

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchMovieById(id)
      .then(setMovie)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="movie-page movie-page--error">
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Retour</button>
      </div>
    );
  }

  if (!movie) {
    return <div className="movie-page movie-page--loading">Chargement...</div>;
  }

  return (
    <div className="movie-page">
      <button className="movie-page__back" onClick={() => navigate("/")}>
        ← Retour
      </button>
      <div className="movie-page__content">
        <img
          className="movie-page__poster"
          src={getPosterUrl(movie.poster)}
          alt={movie.title}
        />
        <div className="movie-page__info">
          <h1 className="movie-page__title">{movie.title}</h1>
          <div className="movie-page__meta">
            {movie.year && <span>{movie.year}</span>}
            {movie.runtime && <span>{movie.runtime} min</span>}
          </div>
          <p className="movie-page__overview">{movie.overview}</p>
          <button
            className="movie-page__watch"
            onClick={() => navigate(`/film/${movie.id}/regarder`)}
          >
            ▶ Regarder
          </button>
        </div>
      </div>
    </div>
  );
}
