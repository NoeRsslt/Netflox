import axios from "axios";
import fs from "fs";
import path from "path";
import { CONFIG } from "../config.js";

export async function searchMovie(title, year) {
  if (!CONFIG.TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY manquant dans le fichier .env");
  }

  const response = await axios.get(`${CONFIG.TMDB_BASE_URL}/search/movie`, {
    params: {
      api_key: CONFIG.TMDB_API_KEY,
      query: title,
      year: year || undefined,
      language: "fr-FR",
    },
  });

  const results = response.data.results;
  return results && results.length > 0 ? results[0] : null;
}

export async function getMovieDetails(tmdbId) {
  const response = await axios.get(`${CONFIG.TMDB_BASE_URL}/movie/${tmdbId}`, {
    params: {
      api_key: CONFIG.TMDB_API_KEY,
      language: "fr-FR",
    },
  });
  return response.data;
}

export async function downloadPoster(posterPath, tmdbId) {
  if (!posterPath) return null;

  if (!fs.existsSync(CONFIG.POSTERS_DIR)) {
    fs.mkdirSync(CONFIG.POSTERS_DIR, { recursive: true });
  }

  const filename = `${tmdbId}.jpg`;
  const localPath = path.join(CONFIG.POSTERS_DIR, filename);

  // Réutilise l'affiche si elle a déjà été téléchargée (évite un appel TMDB inutile)
  if (fs.existsSync(localPath)) {
    return `/posters/${filename}`;
  }

  const url = `${CONFIG.TMDB_IMAGE_BASE_URL}${posterPath}`;
  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(localPath, response.data);

  return `/posters/${filename}`;
}
