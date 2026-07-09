import fs from "fs";
import path from "path";
import { CONFIG } from "../config.js";

function ensureCacheFile() {
  const dir = path.dirname(CONFIG.CACHE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(CONFIG.CACHE_FILE)) {
    fs.writeFileSync(CONFIG.CACHE_FILE, JSON.stringify({}, null, 2));
  }
}

export function readCache() {
  ensureCacheFile();
  const raw = fs.readFileSync(CONFIG.CACHE_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeCache(cache) {
  ensureCacheFile();
  fs.writeFileSync(CONFIG.CACHE_FILE, JSON.stringify(cache, null, 2));
}
