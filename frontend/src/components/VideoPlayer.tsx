import { useEffect, useRef, useState } from "react";
import type { SubtitleTrack } from "../types/movie";
import "./VideoPlayer.css";

interface VideoPlayerProps {
  src: string;
  title: string;
  subtitles: SubtitleTrack[];
  getSubtitleUrl: (lang: string) => string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function VideoPlayer({
  src,
  title,
  subtitles,
  getSubtitleUrl,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState<string>("off");
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.pause();
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Active/désactive la piste de sous-titres sélectionnée
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      track.mode = track.language === activeSubtitle ? "showing" : "hidden";
    }
  }, [activeSubtitle, subtitles]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current;
    if (!video) return;
    const value = Number(e.target.value);
    video.currentTime = value;
    setCurrentTime(value);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current;
    if (!video) return;
    const value = Number(e.target.value);
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function toggleFullscreen() {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  function skip(seconds: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), duration || Infinity);
  }

  function resetControlsTimer() {
    setShowControls(true);
    if (hideControlsTimer.current) window.clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = window.setTimeout(() => {
      setShowControls((prev) => (isPlaying ? false : prev));
    }, 3000);
  }

  const remaining = duration ? duration - currentTime : 0;

  return (
    <div
      ref={containerRef}
      className={`video-player ${showControls ? "" : "video-player--controls-hidden"}`}
      onMouseMove={resetControlsTimer}
    >
      <video
        ref={videoRef}
        className="video-player__video"
        src={src}
        autoPlay
        onClick={togglePlay}
      >
        {subtitles.map((sub) => (
          <track
            key={sub.lang}
            kind="subtitles"
            src={getSubtitleUrl(sub.lang)}
            srcLang={sub.lang}
            label={sub.label}
          />
        ))}
      </video>

      <div className="video-player__controls">
        <div className="video-player__title-bar">{title}</div>

        <div className="video-player__bottom">
          <input
            className="video-player__progress"
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
          />

          <div className="video-player__row">
            <div className="video-player__group">
              <button className="video-player__btn" onClick={togglePlay} title={isPlaying ? "Pause" : "Lecture"}>
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button className="video-player__btn" onClick={() => skip(-10)} title="Reculer de 10s">
                ⏪
              </button>
              <button className="video-player__btn" onClick={() => skip(10)} title="Avancer de 10s">
                ⏩
              </button>

              <div className="video-player__volume">
                <button className="video-player__btn" onClick={toggleMute} title="Volume">
                  {muted || volume === 0 ? "🔇" : "🔊"}
                </button>
                <input
                  className="video-player__volume-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                />
              </div>

              <span className="video-player__time">
                {formatTime(currentTime)} · -{formatTime(remaining)}
              </span>
            </div>

            <div className="video-player__group">
              {subtitles.length > 0 && (
                <div className="video-player__subtitles">
                  <button
                    className="video-player__btn"
                    onClick={() => setShowSubtitleMenu((v) => !v)}
                    title="Sous-titres"
                  >
                    💬
                  </button>
                  {showSubtitleMenu && (
                    <div className="video-player__subtitle-menu">
                      <button
                        className={activeSubtitle === "off" ? "active" : ""}
                        onClick={() => {
                          setActiveSubtitle("off");
                          setShowSubtitleMenu(false);
                        }}
                      >
                        Désactivés
                      </button>
                      {subtitles.map((sub) => (
                        <button
                          key={sub.lang}
                          className={activeSubtitle === sub.lang ? "active" : ""}
                          onClick={() => {
                            setActiveSubtitle(sub.lang);
                            setShowSubtitleMenu(false);
                          }}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button className="video-player__btn" onClick={toggleFullscreen} title="Plein écran">
                {isFullscreen ? "⤢" : "⛶"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
