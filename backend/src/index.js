import cors from "cors";
import express from "express";
import { CONFIG } from "./config.js";
import moviesRouter from "./routes/movies.js";
import { startScanLoop } from "./services/scanner.js";

const app = express();

app.use(cors());
app.use("/posters", express.static(CONFIG.POSTERS_DIR));
app.use("/api", moviesRouter);

app.listen(CONFIG.PORT, () => {
  console.log(
    `[server] Netflox backend démarré sur http://localhost:${CONFIG.PORT}`
  );
  startScanLoop();
});
