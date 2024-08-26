import { cn, formatDuration } from "@/lib/utils";
import "@/styles/videoPlayer.css";
import { useCallback, useEffect, useRef, useState } from "react";

const VideoPlayer = (props) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [duration, setDuration] = useState("");
  const [isFraction, setIsFraction] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState("high");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const timelineContainerRef = useRef(null);

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  }, []);

  const handleTheaterMode = useCallback(() => {
    setIsTheaterMode((prev) => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  }, []);

  const toggleMiniPlayer = useCallback(() => {
    const video = videoRef.current;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      video?.requestPictureInPicture();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setVolumeLevel(
        video.muted ? "muted" : video.volume >= 0.5 ? "high" : "low",
      );
    }
  }, []);

  const changePlaybackSpeed = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      let newPlaybackRate = video.playbackRate + 0.25;
      if (newPlaybackRate > 2) newPlaybackRate = 0.25;
      video.playbackRate = newPlaybackRate;
      setPlaybackSpeed(newPlaybackRate);
      setIsFraction(newPlaybackRate % 1 !== 0);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const videoContainer = videoContainerRef.current;
    const timeline = timelineContainerRef.current;

    if (!video || !videoContainer || !timeline) return;

    let isScrubbing = false;
    let wasPaused = false;

    const handleKeydown = (e) => {
      const tagName = document.activeElement?.tagName.toLowerCase();
      if (tagName === "input") return;

      const keyHandlers = {
        " ": () => tagName !== "button" && handlePlayPause(),
        k: handlePlayPause,
        t: handleTheaterMode,
        f: toggleFullscreen,
        i: toggleMiniPlayer,
        m: toggleMute,
        arrowleft: () => {
          video.currentTime -= 5;
        },
        j: () => {
          video.currentTime -= 5;
        },
        arrowright: () => {
          video.currentTime += 5;
        },
        l: () => {
          video.currentTime += 5;
        },
      };

      const handler = keyHandlers[e.key.toLowerCase()];
      if (handler) handler();
    };

    const updateTimeline = (e) => {
      const rect = timeline.getBoundingClientRect();
      const percent =
        Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
      timeline.style.setProperty("--preview-position", percent.toString());
      if (isScrubbing) {
        e.preventDefault();
        timeline.style.setProperty("--progress-position", percent.toString());
      }
    };

    const toggleScrubbing = (e) => {
      const rect = timeline.getBoundingClientRect();
      const percent =
        Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
      isScrubbing = (e.buttons & 1) === 1;
      videoContainer.classList.toggle("scrubbing", isScrubbing);
      if (isScrubbing) {
        wasPaused = video.paused;
        video.pause();
      } else {
        video.currentTime = percent * video.duration;
        if (!wasPaused) video.play();
      }
      updateTimeline(e);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(formatDuration(video.currentTime));
      const percent = video.currentTime / video.duration;
      timeline.style.setProperty("--progress-position", percent.toString());
    };

    const handleVolumeChange = () => {
      const volume = video.volume;
      const isMuted = video.muted || volume === 0;
      setVolumeLevel(isMuted ? "muted" : volume >= 0.5 ? "high" : "low");
      videoContainer.dataset.volumeLevel = isMuted
        ? "muted"
        : volume >= 0.5
          ? "high"
          : "low";
    };

    video.addEventListener("click", handlePlayPause);
    video.addEventListener("play", () => setIsPaused(false));
    video.addEventListener("pause", () => setIsPaused(true));
    video.addEventListener("loadeddata", () =>
      setDuration(formatDuration(video.duration)),
    );
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("enterpictureinpicture", () =>
      videoContainer.classList.add("mini-player"),
    );
    video.addEventListener("leavepictureinpicture", () =>
      videoContainer.classList.remove("mini-player"),
    );

    timeline.addEventListener("mousemove", updateTimeline);
    timeline.addEventListener("mousedown", toggleScrubbing);
    document.addEventListener(
      "mouseup",
      (e) => isScrubbing && toggleScrubbing(e),
    );
    document.addEventListener(
      "mousemove",
      (e) => isScrubbing && updateTimeline(e),
    );
    document.addEventListener("keydown", handleKeydown);

    return () => {
      video.removeEventListener("click", handlePlayPause);
      video.removeEventListener("play", () => setIsPaused(false));
      video.removeEventListener("pause", () => setIsPaused(true));
      video.removeEventListener("loadeddata", () =>
        setDuration(formatDuration(video.duration)),
      );
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("enterpictureinpicture", () =>
        videoContainer.classList.add("mini-player"),
      );
      video.removeEventListener("leavepictureinpicture", () =>
        videoContainer.classList.remove("mini-player"),
      );

      timeline.removeEventListener("mousemove", updateTimeline);
      timeline.removeEventListener("mousedown", toggleScrubbing);
      document.removeEventListener(
        "mouseup",
        (e) => isScrubbing && toggleScrubbing(e),
      );
      document.removeEventListener(
        "mousemove",
        (e) => isScrubbing && updateTimeline(e),
      );
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [
    handlePlayPause,
    handleTheaterMode,
    toggleFullscreen,
    toggleMiniPlayer,
    toggleMute,
  ]);

  return (
    <div
      ref={videoContainerRef}
      className={cn(
        "group relative mx-auto flex h-full max-h-[570px] w-[90%] max-w-[1000px] justify-center bg-black",
        isTheaterMode && "max-h-[90svh] w-full max-w-[initial]",
        isFullScreen && "max-h-svh w-full max-w-[initial]",
      )}
    >
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-[100] from-black/75 to-transparent text-white opacity-0 transition-opacity before:pointer-events-none before:absolute before:bottom-0 before:-z-[1] before:aspect-[6/1] before:w-full before:bg-gradient-to-t focus-within:opacity-100 group-hover:opacity-100",
          isPaused && "opacity-100",
        )}
      >
        <div className="timeline-container" ref={timelineContainerRef}>
          <div className="timeline">
            <div className="thumb"></div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1">
          <button onClick={handlePlayPause} className="videoBtn">
            {isPaused ? (
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
              </svg>
            )}
          </button>

          <div className="group/slider flex items-center gap-1">
            <button onClick={toggleMute} className="videoBtn">
              {volumeLevel === "high" && (
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"
                  />
                </svg>
              )}
              {volumeLevel === "low" && (
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z"
                  />
                </svg>
              )}
              {volumeLevel === "muted" && (
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z"
                  />
                </svg>
              )}
            </button>
            <input
              type="range"
              className="w-0 origin-left scale-x-0 transition-all group-focus-within/slider:w-[100px] group-focus-within/slider:scale-x-100 group-hover/slider:w-[100px] group-hover/slider:scale-x-100"
              min={0}
              max={1}
              step="any"
              value={videoRef.current?.volume || 0}
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.volume = parseFloat(e.target.value);
                  videoRef.current.muted = videoRef.current.volume === 0;
                }
              }}
            />
          </div>

          <div className="flex flex-grow items-center gap-1">
            <div>{currentTime}</div>/<div>{duration}</div>
          </div>

          <button
            onClick={changePlaybackSpeed}
            className={cn("videoBtn", isFraction && "w-12")}
          >
            {playbackSpeed}x
          </button>

          <button onClick={toggleMiniPlayer} className="videoBtn">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z"
              />
            </svg>
          </button>

          <button onClick={handleTheaterMode} className="videoBtn">
            {isTheaterMode ? (
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"
                />
              </svg>
            )}
          </button>

          <button onClick={toggleFullscreen} className="videoBtn">
            {isFullScreen ? (
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        preload="none"
        aria-label="Video player"
        className="w-full"
      >
        <source src={`http://localhost:8080/video/${props.videoId}`} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
