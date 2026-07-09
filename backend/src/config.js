import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

export const CONFIG = {
  PORT: process.env.PORT || 4000,
  TMDB_API_KEY: process.env.TMDB_API_KEY || "",
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  TMDB_IMAGE_BASE_URL: "https://image.tmdb.org/t/p/w500",
  FILMS_DIR: "C:\\Users\\noero\\Videos\\Films",
  POSTERS_DIR: "C:\\Users\\noero\\Videos\\Films\\posters",
  CACHE_FILE: "C:\\Users\\noero\\Videos\\Films\\cache\\movies.json",
  SCAN_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
  VIDEO_EXTENSIONS: [".mp4", ".mkv", ".avi", ".mov", ".webm"],
};
