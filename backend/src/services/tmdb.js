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

  if (!results || results.length === 0) {
    return null;
  }

  // Normalise une chaîne pour la comparaison
  const normalize = (str) =>
    (str || "")
      .toLowerCase()
      .replace(/[:\-–]/g, " ")
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const wanted = normalize(title);
  const wantedPart = wanted.match(/\bpart\s+(\d+)\b/i)?.[1];

  // Score de similarité simple
  function score(movie) {
    const titles = [
      normalize(movie.title),
      normalize(movie.original_title),
    ];
    if (wantedPart) {
    const hasMatchingPart = titles.some((t) =>
      t.includes(`part ${wantedPart}`)
    );

    if (!hasMatchingPart) {
      return -1000;
    }
    }

    let best = 0;

    for (const t of titles) {
      if (t === wanted) return 1000;

      let s = 0;

      if (t.includes(wanted)) s += 100;
      if (wanted.includes(t)) s += 80;

      const wantedWords = wanted.split(" ");
      const titleWords = t.split(" ");

      for (const word of wantedWords) {
        if (titleWords.includes(word)) {
          s += 10;
        }
      }

      if (s > best) {
        best = s;
      }
    }

    return best;
  }

  results.sort((a, b) => score(b) - score(a));

  return results[0];
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
