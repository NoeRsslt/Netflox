import fs from "fs";
import path from "path";
import { CONFIG } from "../config.js";
import { readCache, writeCache } from "./cache.js";
import { downloadPoster, getMovieDetails, searchMovie } from "./tmdb.js";

// Extrait un titre "propre" et une année à partir du nom de fichier
function parseFilename(filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);

  const cleaned = base.replace(/[._]/g, " ").trim();
  const yearMatch = cleaned.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : null;

  let title = cleaned;
  if (yearMatch) {
    title = cleaned.slice(0, yearMatch.index).trim();
  }
  title = title.replace(/[-–]\s*$/, "").trim();

  return { title, year };
}

function listVideoFiles() {
  if (!fs.existsSync(CONFIG.FILMS_DIR)) {
    fs.mkdirSync(CONFIG.FILMS_DIR, { recursive: true });
    return [];
  }
  return fs
    .readdirSync(CONFIG.FILMS_DIR)
    .filter((file) =>
      CONFIG.VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase())
    );
}

export async function scanLibrary() {
  console.log("[scanner] Scan de la bibliothèque en cours...");
  const cache = readCache();
  const videoFiles = listVideoFiles();
  let updated = false;

  for (const filename of videoFiles) {
    // Fichier déjà en cache : on ne refait pas l'appel TMDB
    if (cache[filename]) {
      continue;
    }

    const { title, year } = parseFilename(filename);

    try {
      const result = await searchMovie(title, year);
      if (!result) {
        console.warn(`[scanner] Aucun résultat TMDB pour "${title}"`);
        continue;
      }

      const details = await getMovieDetails(result.id);
      const posterUrl = await downloadPoster(details.poster_path, details.id);

      cache[filename] = {
        id: String(details.id),
        title: details.title,
        year: details.release_date
          ? parseInt(details.release_date.slice(0, 4), 10)
          : null,
        runtime: details.runtime || null,
        overview: details.overview || "",
        poster: posterUrl || "",
        filename,
      };

      updated = true;
      console.log(`[scanner] Ajouté : ${details.title}`);
    } catch (err) {
      console.error(`[scanner] Erreur pour "${filename}" :`, err.message);
    }
  }

  // Retire du cache les films dont le fichier vidéo a été supprimé
  for (const filename of Object.keys(cache)) {
    if (!videoFiles.includes(filename)) {
      delete cache[filename];
      updated = true;
    }
  }

  if (updated) {
    writeCache(cache);
  }

  console.log(
    `[scanner] Scan terminé. ${Object.keys(cache).length} film(s) en bibliothèque.`
  );
}

export function startScanLoop() {
  scanLibrary();
  setInterval(scanLibrary, CONFIG.SCAN_INTERVAL_MS);
}
