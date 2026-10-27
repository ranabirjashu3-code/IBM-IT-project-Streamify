
import { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { BsArrowLeft } from "react-icons/bs";
import video from "../assets/video.mp4";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { firebaseAuth } from "../Utils/firebase-config";
import VideoInteractions from "../components/VideoInteractions";
import Comments from "../components/Comments";
import Footer from "../components/Footer";
import PlayerRecommendations from "../components/PlayerRecommendations";

export default function Player() {
  const navigate = useNavigate();
  const location = useLocation();

  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const movie = location.state?.movie;

  const contentId = movie?.id ?? movie?.movieId;

  const interactionId =
    contentId != null ? String(contentId) : "";

  const watchedTime = location.state?.watchedTime || 0;

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Start the player page at the top
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  // Restore previous playback position
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;

    setDuration(videoElement.duration);

    if (
      watchedTime > 0 &&
      watchedTime < videoElement.duration
    ) {
      videoElement.currentTime = watchedTime;

      console.log(
        "Resuming from:",
        watchedTime,
        "seconds"
      );
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Save playback progress to the backend
  const saveProgress = async () => {
    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const user = firebaseAuth.currentUser;

      if (!user || !movie || !videoRef.current) {
        return;
      }

      const videoElement = videoRef.current;

      await axios.post(`${API_URL}/api/watch-history`, {
        firebaseUid: user.uid,
        movieId: movie.id ?? movie.movieId,
        title: movie.name || movie.title,
        posterPath: movie.image || movie.posterPath,
        watchedTime: videoElement.currentTime,
        duration: videoElement.duration,
      });

      console.log("Watch progress saved");
    } catch (error) {
      console.error(
        "Failed to save watch progress:",
        error
      );
    }
  };

  const handleBack = async () => {
    await saveProgress();
    navigate(-1);
  };

  return (
    <Container ref={containerRef}>
      {/* Video player */}
      <div className="player">
        <button
          type="button"
          className="back"
          aria-label="Go back"
          onClick={handleBack}
        >
          <BsArrowLeft />
        </button>

        <video
          ref={videoRef}
          src={video}
          autoPlay
          controls
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>

      {/* Player content: interactions/comments on left,
          recommendations on right */}
      <div className="player-content-layout">
        <main className="player-main-column">
          <div className="interactions">
            <VideoInteractions
              contentId={interactionId}
            />
          </div>

          <div className="comments-wrapper">
            <Comments contentId={interactionId} />
          </div>
        </main>

        <aside className="recommendations-sidebar">
          <PlayerRecommendations movie={movie} />
        </aside>
      </div>

      <Footer />
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #000;
  color: #fff;
  overflow-x: clip;
  position: relative;

  /* ==============================
     VIDEO PLAYER
  ============================== */

  .player {
    position: relative;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    overflow: hidden;
    scroll-margin-top: 0;
  }

  .player::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 140px;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.75),
      transparent
    );
    z-index: 2;
    pointer-events: none;
  }

  .player::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 120px;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.7),
      transparent
    );
    z-index: 2;
    pointer-events: none;
  }

  .player > video {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    background: #000;
    outline: none;
    border: none;
  }

  .player video::-webkit-media-controls-panel {
    background-image: linear-gradient(
      transparent,
      rgba(0, 0, 0, 0.85)
    );
  }

  /* ==============================
     BACK BUTTON
  ============================== */

  .back {
    position: absolute;
    top: 28px;
    left: 28px;
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(20, 20, 20, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    cursor: pointer;
    z-index: 10;
    padding: 0;
    transition:
      background 0.25s ease,
      transform 0.25s ease,
      border-color 0.25s ease;
  }

  .back svg {
    font-size: 1.7rem;
    color: #fff;
    transition: transform 0.25s ease;
  }

  .back:hover {
    background: rgba(229, 9, 20, 0.9);
    border-color: #e50914;
    transform: scale(1.08);
  }

  .back:hover svg {
    transform: translateX(-3px);
  }

  .back:active {
    transform: scale(0.95);
  }

  /* ==============================
     TWO-COLUMN CONTENT LAYOUT
  ============================== */

  .player-content-layout {
    display: grid;
    grid-template-columns:
      minmax(0, 2.2fr)
      minmax(300px, 0.85fr);
    align-items: start;
    gap: 20px;

    width: 100%;
    max-width: 1900px;
    margin: 0 auto;
    padding: 0 14px 24px;
    box-sizing: border-box;
  }

  .player-main-column,
  .recommendations-sidebar {
    min-width: 0;
    width: 100%;
  }

  .player-main-column {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .recommendations-sidebar {
    align-self: start;
    overflow: visible;
  }

  /* ==============================
     VIDEO INTERACTIONS
  ============================== */

  .interactions {
    width: 100%;
    min-height: 0;
    background: #000;
    position: relative;
    z-index: 20;
    padding: 8px 0 10px;
    box-sizing: border-box;
  }

  /* ==============================
     COMPACT COMMENTS PANEL
  ============================== */

  .comments-wrapper {
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .comments-wrapper > * {
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .comments-wrapper > * {
    padding: 16px !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  .comments-wrapper input,
  .comments-wrapper textarea {
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .comments-wrapper textarea {
    min-height: 42px;
  }

  /* ==============================
     TABLET
  ============================== */

  @media (max-width: 850px) {
    .player-content-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
      padding: 0 12px 20px;
    }

    .recommendations-sidebar {
      width: 100%;
    }

    .player-main-column {
      gap: 6px;
    }

    .interactions {
      padding: 8px 0;
    }

    .comments-wrapper > * {
      padding: 13px !important;
    }
  }

  /* ==============================
     MOBILE
  ============================== */

  @media (max-width: 480px) {
    .back {
      top: 14px;
      left: 14px;
      width: 38px;
      height: 38px;
    }

    .back svg {
      font-size: 1.35rem;
    }

    .player::before {
      height: 100px;
    }

    .player::after {
      height: 90px;
    }

    .player-content-layout {
      padding: 0 8px 16px;
      gap: 12px;
    }

    .comments-wrapper > * {
      padding: 10px !important;
    }
  }
`;
