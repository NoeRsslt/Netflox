import type { Movie, SubtitleTrack } from "../types/movie";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_BASE_URL}/api/movies`);
  if (!res.ok) throw new Error("Erreur lors du chargement des films");
  return res.json();
}

export async function fetchMovieById(id: string): Promise<Movie> {
  const res = await fetch(`${API_BASE_URL}/api/movies/${id}`);
  if (!res.ok) throw new Error("Film introuvable");
  return res.json();
}

export function getPosterUrl(posterPath: string): string {
  if (!posterPath) return "";
  if (posterPath.startsWith("http")) return posterPath;
  return `${API_BASE_URL}${posterPath}`;
}

// Retourne l'URL du flux vidéo (streaming HTTP avec support des requêtes Range)
export function getStreamUrl(id: string): string {
  return `${API_BASE_URL}/api/movies/${id}/stream`;
}

export async function fetchSubtitles(id: string): Promise<SubtitleTrack[]> {
  const res = await fetch(`${API_BASE_URL}/api/movies/${id}/subtitles`);
  if (!res.ok) return [];
  return res.json();
}

export function getSubtitleUrl(id: string, lang: string): string {
  return `${API_BASE_URL}/api/movies/${id}/subtitles/${lang}`;
}
