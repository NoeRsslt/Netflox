import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

// FILMS_DIR est surchargeable via variable d'environnement (voir Docker Compose).
// Par défaut : /data/films, chemin utilisé à l'intérieur du conteneur.
const FILMS_DIR = process.env.FILMS_DIR || "/data/films";

export const CONFIG = {
  PORT: process.env.PORT || 4000,
  TMDB_API_KEY: process.env.TMDB_API_KEY || "",
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  TMDB_IMAGE_BASE_URL: "https://image.tmdb.org/t/p/w500",
  FILMS_DIR,
  POSTERS_DIR: process.env.POSTERS_DIR || path.join(FILMS_DIR, "posters"),
  CACHE_FILE: process.env.CACHE_FILE || path.join(FILMS_DIR, "cache", "movies.json"),
  SCAN_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
  VIDEO_EXTENSIONS: [".mp4", ".mkv", ".avi", ".mov", ".webm"],
};