
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

export default function Player() {
  const navigate = useNavigate();
  const location = useLocation();

  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const movie = location.state?.movie;

  const contentId = movie?.id || movie?.movieId;

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
        movieId: movie.id || movie.movieId,
        title: movie.name || movie.title,
        posterPath: movie.image || movie.posterPath,
        watchedTime: videoElement.currentTime,
        duration: videoElement.duration,
      });

      console.log("Watch progress saved");
    } catch (error) {
      console.error("Failed to save watch progress:", error);
    }
  };

  const handleBack = async () => {
    await saveProgress();
    navigate(-1);
  };

  return (
    <Container ref={containerRef}>
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

      <div className="interactions">
        <VideoInteractions contentId={interactionId} />
      </div>

      <div className="comments">
        <Comments contentId={contentId} />
      </div>

      <Footer />
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #000;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;

  .player {
    position: relative;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
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
      rgba(0, 0, 0, 0)
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
      rgba(0, 0, 0, 0)
    );
    z-index: 2;
    pointer-events: none;
  }

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
    border-color: rgba(229, 9, 20, 1);
    transform: scale(1.08);
  }

  .back:hover svg {
    transform: translateX(-3px);
  }

  .back:active {
    transform: scale(0.95);
  }

  video {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    background: #000;
    outline: none;
    border: none;
  }

  video::-webkit-media-controls-panel {
    background-image: linear-gradient(
      transparent,
      rgba(0, 0, 0, 0.85)
    );
  }

  .interactions {
    width: 100%;
    min-height: 100px;
    background: #000;
    position: relative;
    z-index: 20;
    padding: 20px 30px;
    box-sizing: border-box;
  }

  .comments {
    position: relative;
    width: 100%;
    scroll-margin-top: 0;
  }

  @media (max-width: 768px) {
    .back {
      top: 18px;
      left: 18px;
      width: 42px;
      height: 42px;
    }

    .back svg {
      font-size: 1.5rem;
    }

    .player::before {
      height: 100px;
    }

    .player::after {
      height: 90px;
    }

    .interactions {
      padding: 15px 20px;
    }
  }

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

    .interactions {
      padding: 15px;
    }
  }
`;
