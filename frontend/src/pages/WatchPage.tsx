import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { fetchMovieById, fetchSubtitles, getStreamUrl, getSubtitleUrl } from "../services/api";
import type { Movie, SubtitleTrack } from "../types/movie";
import "./WatchPage.css";

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchMovieById(id)
      .then(setMovie)
      .catch((err) => setError(err.message));
    fetchSubtitles(id).then(setSubtitles);
  }, [id]);

  if (error) {
    return (
      <div className="watch-page watch-page--error">
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Retour</button>
      </div>
    );
  }

  if (!movie || !id) {
    return <div className="watch-page watch-page--loading">Chargement...</div>;
  }

  return (
    <div className="watch-page">
      <button className="watch-page__back" onClick={() => navigate(`/film/${id}`)}>
        ← Retour
      </button>
      <div className="watch-page__player">
        <VideoPlayer
          src={getStreamUrl(id)}
          title={movie.title}
          subtitles={subtitles}
          getSubtitleUrl={(lang) => getSubtitleUrl(id, lang)}
        />
      </div>
    </div>
  );
}
