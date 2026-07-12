import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import { CONFIG } from "../config.js";

const LANG_LABELS = {
  fr: "Français",
  en: "English",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands",
  ja: "日本語",
  ru: "Русский",
  ar: "العربية",
};

function labelFor(lang) {
  return LANG_LABELS[(lang || "").toLowerCase()] || lang.toUpperCase();
}

// Recherche des fichiers .srt externes portant le même nom que le film
// (ex: "Film.mp4" -> "Film.fr.srt", "Film.en.srt", ou simplement "Film.srt")
function findExternalSubtitles(videoFilename) {
  const ext = path.extname(videoFilename);
  const base = path.basename(videoFilename, ext);

  if (!fs.existsSync(CONFIG.FILMS_DIR)) return [];

  const srtFiles = fs
    .readdirSync(CONFIG.FILMS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".srt"));

  const subs = [];
  for (const f of srtFiles) {
    const fBase = f.slice(0, -4); // retire ".srt"
    if (fBase === base) {
      subs.push({ lang: "und", label: labelFor("und"), source: "external" });
    } else if (fBase.startsWith(`${base}.`)) {
      const lang = fBase.slice(base.length + 1);
      if (lang) subs.push({ lang, label: labelFor(lang), source: "external" });
    }
  }
  return subs;
}

export function getExternalSubtitlePath(videoFilename, lang) {
  const ext = path.extname(videoFilename);
  const base = path.basename(videoFilename, ext);
  const filename = lang === "und" ? `${base}.srt` : `${base}.${lang}.srt`;
  const fullPath = path.join(CONFIG.FILMS_DIR, filename);
  return fs.existsSync(fullPath) ? fullPath : null;
}

// Vérifie une seule fois si ffprobe est disponible sur le système
let ffprobeAvailable = null;
function checkFfprobe() {
  return new Promise((resolve) => {
    if (ffprobeAvailable !== null) return resolve(ffprobeAvailable);
    execFile("ffprobe", ["-version"], (err) => {
      ffprobeAvailable = !err;
      resolve(ffprobeAvailable);
    });
  });
}

// Liste les pistes de sous-titres intégrées au fichier vidéo (sans transcodage, simple sondage)
function probeEmbeddedSubtitles(videoPath) {
  return new Promise((resolve) => {
    execFile(
      "ffprobe",
      [
        "-v", "error",
        "-select_streams", "s",
        "-show_entries", "stream=index:stream_tags=language",
        "-of", "json",
        videoPath,
      ],
      (err, stdout) => {
        if (err) return resolve([]);
        try {
          const data = JSON.parse(stdout);
          const streams = data.streams || [];
          resolve(
            streams.map((s, i) => {
              const lang = s.tags?.language || `piste${i + 1}`;
              return {
                lang,
                label: labelFor(lang),
                source: "embedded",
                streamIndex: s.index,
              };
            })
          );
        } catch {
          resolve([]);
        }
      }
    );
  });
}

// Retourne la liste des sous-titres disponibles pour un film.
// Priorité aux fichiers .srt externes ; à défaut, pistes intégrées si ffprobe est disponible.
export async function listSubtitles(videoFilename) {
  const external = findExternalSubtitles(videoFilename);
  if (external.length > 0) return external;

  const hasFfprobe = await checkFfprobe();
  if (!hasFfprobe) return [];

  const videoPath = path.join(CONFIG.FILMS_DIR, videoFilename);
  return probeEmbeddedSubtitles(videoPath);
}

// Convertit un contenu .srt en WebVTT (format requis par <track> HTML5)
export function srtToVtt(srtContent) {
  const body = srtContent
    .replace(/\r+/g, "")
    .replace(/^\uFEFF/, "")
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  return `WEBVTT\n\n${body}`;
}

// Extrait une piste de sous-titres intégrée en WebVTT via ffmpeg (copie de flux, sans transcodage vidéo)
export function extractEmbeddedSubtitleVtt(videoPath, streamIndex, callback) {
  execFile(
    "ffmpeg",
    ["-y", "-i", videoPath, "-map", `0:${streamIndex}`, "-c:s", "webvtt", "-f", "webvtt", "pipe:1"],
    { maxBuffer: 1024 * 1024 * 20 },
    (err, stdout) => {
      if (err) return callback(err);
      callback(null, stdout);
    }
  );
}
