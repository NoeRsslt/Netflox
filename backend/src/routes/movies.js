import { Router } from "express";
import { readCache } from "../services/cache.js";

const router = Router();

router.get("/movies", (req, res) => {
  const cache = readCache();
  const movies = Object.values(cache);
  res.json(movies);
});

router.get("/movies/:id", (req, res) => {
  const cache = readCache();
  const movie = Object.values(cache).find((m) => m.id === req.params.id);
  if (!movie) {
    return res.status(404).json({ error: "Film introuvable" });
  }
  res.json(movie);
});

export default router;
