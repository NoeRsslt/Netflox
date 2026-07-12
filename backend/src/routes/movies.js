import fs from "fs";
import path from "path";
import { Router } from "express";
import { CONFIG } from "../config.js";
import { readCache } from "../services/cache.js";
import {
  extractEmbeddedSubtitleVtt,
  getExternalSubtitlePath,
  listSubtitles,
  srtToVtt,
} from "../services/subtitles.js";

const router = Router();

const MIME_TYPES = {
  ".mp4": "video/mp4",
  ".mkv": "video/x-matroska",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
};

function getMimeType(filename) {
  return MIME_TYPES[path.extname(filename).toLowerCase()] || "application/octet-stream";
}

function findMovie(id) {
  const cache = readCache();
  return Object.values(cache).find((m) => m.id === id);
}

router.get("/movies", (req, res) => {
  const cache = readCache();
  const movies = Object.values(cache);
  res.json(movies);
});

router.get("/movies/:id", (req, res) => {
  const movie = findMovie(req.params.id);
  if (!movie) {
    return res.status(404).json({ error: "Film introuvable" });
  }
  res.json(movie);
});

// Flux vidéo avec prise en charge des requêtes Range (permet de se déplacer dans la vidéo
// sans télécharger le fichier complet). Aucun transcodage : le fichier est envoyé tel quel.
router.get("/movies/:id/stream", (req, res) => {
  const movie = findMovie(req.params.id);
  if (!movie) {
    return res.status(404).json({ error: "Film introuvable" });
  }

  const filePath = path.join(CONFIG.FILMS_DIR, movie.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Fichier vidéo introuvable" });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const contentType = getMimeType(movie.filename);
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const match = range.match(/bytes=(\d*)-(\d*)/);
  if (!match) {
    res.status(416).set("Content-Range", `bytes */${fileSize}`).end();
    return;
  }

  const start = match[1] ? parseInt(match[1], 10) : 0;
  const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= fileSize) {
    res.status(416).set("Content-Range", `bytes */${fileSize}`).end();
    return;
  }

  const safeEnd = Math.min(end, fileSize - 1);
  const chunkSize = safeEnd - start + 1;

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${safeEnd}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": contentType,
  });

  fs.createReadStream(filePath, { start, end: safeEnd }).pipe(res);
});

// Liste des sous-titres disponibles pour un film (.srt externes en priorité, sinon pistes intégrées)
router.get("/movies/:id/subtitles", async (req, res) => {
  const movie = findMovie(req.params.id);
  if (!movie) {
    return res.status(404).json({ error: "Film introuvable" });
  }

  try {
    const subs = await listSubtitles(movie.filename);
    res.json(subs.map(({ lang, label, source }) => ({ lang, label, source })));
  } catch (err) {
    console.error("[subtitles] Erreur de détection :", err.message);
    res.json([]);
  }
});

// Sert un fichier de sous-titres au format WebVTT pour une langue donnée
router.get("/movies/:id/subtitles/:lang", async (req, res) => {
  const movie = findMovie(req.params.id);
  if (!movie) {
    return res.status(404).json({ error: "Film introuvable" });
  }

  const { lang } = req.params;

  // 1. Fichier .srt externe
  const externalPath = getExternalSubtitlePath(movie.filename, lang);
  if (externalPath) {
    const srtContent = fs.readFileSync(externalPath, "utf-8");
    res.set("Content-Type", "text/vtt; charset=utf-8");
    return res.send(srtToVtt(srtContent));
  }

  // 2. Piste intégrée au fichier vidéo (extraction du flux de sous-titres uniquement, sans transcodage vidéo)
  const subs = await listSubtitles(movie.filename);
  const track = subs.find((s) => s.source === "embedded" && String(s.lang) === lang);
  if (!track) {
    return res.status(404).json({ error: "Sous-titre introuvable" });
  }

  const videoPath = path.join(CONFIG.FILMS_DIR, movie.filename);
  extractEmbeddedSubtitleVtt(videoPath, track.streamIndex, (err, vtt) => {
    if (err) {
      console.error("[subtitles] Erreur d'extraction ffmpeg :", err.message);
      return res.status(500).json({ error: "Erreur lors de l'extraction des sous-titres" });
    }
    res.set("Content-Type", "text/vtt; charset=utf-8");
    res.send(vtt);
  });
});

export default router;
