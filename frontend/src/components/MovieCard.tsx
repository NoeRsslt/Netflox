import { useNavigate } from "react-router-dom";
import type { Movie } from "../types/movie";
import { getPosterUrl } from "../services/api";
import "./MovieCard.css";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const navigate = useNavigate();

  return (
    <div className="movie-card" onClick={() => navigate(`/film/${movie.id}`)}>
      <img
        className="movie-card__poster"
        src={getPosterUrl(movie.poster)}
        alt={movie.title}
        loading="lazy"
      />
      <p className="movie-card__title">{movie.title}</p>
    </div>
  );
}
