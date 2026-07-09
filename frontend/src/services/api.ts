import type { Movie } from "../types/movie";

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
