
import { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { BsArrowLeft } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { firebaseAuth } from "../Utils/firebase-config";
import VideoInteractions from "../components/VideoInteractions";
import Comments from "../components/Comments";
import Footer from "../components/Footer";
import PlayerRecommendations from "../components/PlayerRecommendations";
import video from "../assets/video.mp4";

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
  const [showFullOverview, setShowFullOverview] =
    useState(false);

  const title = movie?.name || movie?.title || "Untitled";

  const overview =
    movie?.overview ||
    movie?.description ||
    "No description is available for this title yet.";

  const mediaType =
    movie?.mediaType ||
    movie?.media_type ||
    (movie?.first_air_date || movie?.number_of_episodes
      ? "tv"
      : "movie");

  const posterPath =
    movie?.image ||
    movie?.posterPath ||
    movie?.poster_path ||
    "";

  const posterUrl = posterPath
    ? posterPath.startsWith("http")
      ? posterPath
      : `https://image.tmdb.org/t/p/w500${posterPath}`
    : "";

  const releaseDate =
    movie?.releaseDate ||
    movie?.release_date ||
    movie?.first_air_date ||
    "";

  const releaseYear = releaseDate
    ? releaseDate.substring(0, 4)
    : "N/A";

  const rating = Number(
    movie?.rating ?? movie?.vote_average ?? 0
  );

  const genres = Array.isArray(movie?.genres)
    ? movie.genres
        .map((genre) =>
          typeof genre === "string" ? genre : genre?.name
        )
        .filter(Boolean)
    : [];

  const studios = Array.isArray(movie?.studios)
    ? movie.studios
        .map((studio) =>
          typeof studio === "string" ? studio : studio?.name
        )
        .filter(Boolean)
    : Array.isArray(movie?.production_companies)
      ? movie.production_companies
          .map((company) => company?.name)
          .filter(Boolean)
      : [];

  const producers = Array.isArray(movie?.producers)
    ? movie.producers
        .map((producer) =>
          typeof producer === "string"
            ? producer
            : producer?.name
        )
        .filter(Boolean)
    : [];

  const runtime =
    movie?.runtime ||
    movie?.duration ||
    movie?.episode_run_time?.[0] ||
    null;

  const episodeCount =
    movie?.number_of_episodes ??
    movie?.episodes ??
    null;

  const status = movie?.status || "";

  const contentRating =
    movie?.contentRating ||
    movie?.certification ||
    movie?.rating_certificate ||
    "";

  const language =
    movie?.language ||
    movie?.original_language ||
    "";

  const formatList = (items) =>
    items.length ? items.join(", ") : "N/A";

  // Start the player page at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  // Restore previous playback position.
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;

    setDuration(
      Number.isFinite(videoElement.duration)
        ? videoElement.duration
        : 0
    );

    if (
      watchedTime > 0 &&
      watchedTime < videoElement.duration
    ) {
      videoElement.currentTime = watchedTime;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Save playback progress to the backend.
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
        posterPath:
          movie.image ||
          movie.posterPath ||
          movie.poster_path,
        watchedTime: videoElement.currentTime,
        duration: videoElement.duration,
      });
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

      {/* Movie description and metadata */}
      {movie && (
        <section className="details-section">
          <div className="details-layout">
            <div className="poster-wrapper">
              {posterUrl ? (
                <img
                  className="details-poster"
                  src={posterUrl}
                  alt={`${title} poster`}
                />
              ) : (
                <div className="poster-placeholder">
                  No poster available
                </div>
              )}
            </div>

            <div className="details-main">
              <div className="title-row">
                <h1 className="details-title">{title}</h1>
              </div>

              <div className="badges">
                <span className="type-badge">
                  {mediaType.toUpperCase() === "TV"
                    ? "TV"
                    : "MOVIE"}
                </span>

                {contentRating && (
                  <span className="meta-badge">
                    {contentRating}
                  </span>
                )}

                <span className="meta-badge">HD</span>

                {language && (
                  <span className="meta-badge">
                    {language.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="rating-row">
                <span className="rating-star">★</span>

                <strong className="rating-value">
                  {rating > 0 ? rating.toFixed(1) : "N/A"}
                </strong>

                <span className="rating-out-of">
                  / 10
                </span>

                <span className="release-year">
                  {releaseYear}
                </span>
              </div>

              <div className="overview-section">
                <p
                  className={`details-overview ${
                    showFullOverview ? "expanded" : ""
                  }`}
                >
                  {overview}
                </p>

                {overview.length > 180 && (
                  <button
                    type="button"
                    className="more-button"
                    onClick={() =>
                      setShowFullOverview((previous) => !previous)
                    }
                  >
                    {showFullOverview ? "Show less" : "More+"}
                  </button>
                )}
              </div>

              <div className="metadata-grid">
                <div className="metadata-item">
                  <span className="metadata-label">Type:</span>
                  <span className="metadata-value">
                    {mediaType.toUpperCase()}
                  </span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">
                    Released:
                  </span>
                  <span className="metadata-value">
                    {releaseDate || "N/A"}
                  </span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">
                    Status:
                  </span>
                  <span className="metadata-value">
                    {status || "N/A"}
                  </span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">
                    Duration:
                  </span>
                  <span className="metadata-value">
                    {runtime
                      ? `${runtime} min`
                      : "N/A"}
                  </span>
                </div>

                {mediaType === "tv" && (
                  <div className="metadata-item">
                    <span className="metadata-label">
                      Episodes:
                    </span>
                    <span className="metadata-value">
                      {episodeCount ?? "N/A"}
                    </span>
                  </div>
                )}

                <div className="metadata-item full-width">
                  <span className="metadata-label">
                    Genres:
                  </span>
                  <span className="metadata-value">
                    {formatList(genres)}
                  </span>
                </div>

                <div className="metadata-item full-width">
                  <span className="metadata-label">
                    Studios:
                  </span>
                  <span className="metadata-value">
                    {formatList(studios)}
                  </span>
                </div>

                <div className="metadata-item full-width">
                  <span className="metadata-label">
                    Producers:
                  </span>
                  <span className="metadata-value">
                    {formatList(producers)}
                  </span>
                </div>
              </div>
            </div>

            <aside className="rating-panel">
              <div className="rating-stars" aria-label="Rating">
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={index}
                    className={
                      rating > 0 &&
                      rating / 2 >= index + 1
                        ? "star active"
                        : "star"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <div className="rating-caption">
                <span>★</span>{" "}
                {rating > 0 ? rating.toFixed(1) : "N/A"}
                <small>/10</small>
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* Interactions, comments and recommendations */}
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

  /* Video player */

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

  /* Back button */

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
    cursor: pointer;
    z-index: 10;
    padding: 0;
    transition: background 0.25s ease,
      transform 0.25s ease;
  }

  .back svg {
    font-size: 1.7rem;
    color: #fff;
  }

  .back:hover {
    background: #e50914;
    transform: scale(1.08);
  }

  /* Movie description section */

  .details-section {
    position: relative;
    z-index: 1;
    width: 100%;
    padding: 30px 3.5%;
    background: #141414;
    box-sizing: border-box;
  }

  .details-layout {
    display: grid;
    grid-template-columns: 255px minmax(0, 1fr) 270px;
    align-items: start;
    gap: 26px;
    width: 100%;
    max-width: 1800px;
    margin: 0 auto;
  }

  .poster-wrapper {
    width: 100%;
    min-width: 0;
  }

  .details-poster {
    display: block;
    width: 100%;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    border-radius: 3px;
    background: #222;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .poster-placeholder {
    aspect-ratio: 2 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: #222;
    color: #999;
    text-align: center;
  }

  .details-main {
    min-width: 0;
    padding-top: 0;
  }

  .title-row {
    margin-bottom: 14px;
  }

  .details-title {
    margin: 0;
    font-size: clamp(1.35rem, 2vw, 2rem);
    line-height: 1.3;
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .type-badge,
  .meta-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 24px;
    padding: 3px 8px;
    box-sizing: border-box;
    font-size: 0.78rem;
    line-height: 1.2;
  }

  .type-badge {
    background: #e50914;
    color: white;
    font-weight: 700;
  }

  .meta-badge {
    background: #252525;
    color: #bdbdbd;
    border: 1px solid #3a3a3a;
  }

  .rating-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 18px;
  }

  .rating-star {
    color: #f5c518;
    font-size: 1.25rem;
  }

  .rating-value {
    color: #46d369;
    font-size: 1rem;
  }

  .rating-out-of {
    color: #999;
    font-size: 0.85rem;
  }

  .release-year {
    color: #bdbdbd;
    margin-left: 8px;
  }

  .overview-section {
    margin-bottom: 18px;
  }

  .details-overview {
    color: #b5b5b5;
    font-size: 0.95rem;
    line-height: 1.7;
    margin: 0;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    overflow-wrap: anywhere;
  }

  .details-overview.expanded {
    display: block;
    overflow: visible;
  }

  .more-button {
    margin-top: 9px;
    padding: 7px 10px;
    background: #202020;
    color: #fff;
    border: 1px solid #383838;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .more-button:hover {
    background: #333;
  }

  /* Metadata grid */

  .metadata-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 24px;
    row-gap: 13px;
    margin-top: 18px;
  }

  .metadata-item {
    display: grid;
    grid-template-columns: minmax(76px, 0.55fr) minmax(0, 1fr);
    align-items: start;
    gap: 8px;
    min-width: 0;
    font-size: 0.87rem;
    line-height: 1.5;
  }

  .metadata-item.full-width {
    grid-column: 1 / -1;
  }

  .metadata-label {
    color: #777;
  }

  .metadata-value {
    color: #d7d7d7;
    overflow-wrap: anywhere;
  }

  /* Rating panel on the right */

  .rating-panel {
    border: 1px solid #303030;
    background: #151515;
    min-width: 0;
    margin-top: 0;
  }

  .rating-stars {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    gap: 4px;
    padding: 22px 10px;
    border-bottom: 1px solid #303030;
  }

  .star {
    color: #777;
    font-size: clamp(1.3rem, 2vw, 2rem);
  }

  .star.active {
    color: #f5c518;
  }

  .rating-caption {
    padding: 18px 12px;
    text-align: center;
    color: #ddd;
    font-size: 1rem;
  }

  .rating-caption > span {
    color: #e50914;
  }

  .rating-caption small {
    margin-left: 4px;
    color: #888;
  }

  /* Main content: interactions, comments, recommendations */

  .player-content-layout {
    display: grid;
    grid-template-columns: minmax(0, 2.2fr) minmax(300px, 0.85fr);
    align-items: start;
    gap: 20px;
    width: 100%;
    max-width: 1900px;
    margin: 0 auto;
    padding: 20px 14px 24px;
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

  .interactions {
    width: 100%;
    min-height: 0;
    background: #000;
    position: relative;
    z-index: 1;
    padding: 8px 0 10px;
    box-sizing: border-box;
  }

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

  /* Laptop and tablet */

  @media (max-width: 1100px) {
    .details-layout {
      grid-template-columns: 210px minmax(0, 1fr);
      gap: 22px;
    }

    .rating-panel {
      grid-column: 2;
      max-width: 320px;
      width: 100%;
    }

    .player-content-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
      padding: 16px 12px 20px;
    }
  }

  @media (max-width: 650px) {
    .details-section {
      padding: 22px 16px;
    }

    .details-layout {
      grid-template-columns: 115px minmax(0, 1fr);
      gap: 15px;
    }

    .details-title {
      font-size: 1.15rem;
    }

    .title-row {
      margin-bottom: 10px;
    }

    .badges {
      gap: 5px;
      margin-bottom: 10px;
    }

    .type-badge,
    .meta-badge {
      min-height: 22px;
      padding: 3px 6px;
      font-size: 0.7rem;
    }

    .rating-row {
      gap: 5px;
      margin-bottom: 12px;
    }

    .rating-star {
      font-size: 1rem;
    }

    .rating-value {
      font-size: 0.9rem;
    }

    .release-year {
      margin-left: 4px;
      font-size: 0.85rem;
    }

    .details-overview {
      font-size: 0.85rem;
      line-height: 1.55;
      -webkit-line-clamp: 4;
    }

    .overview-section {
      margin-bottom: 14px;
    }

    .metadata-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
      margin-top: 14px;
    }

    .metadata-item.full-width {
      grid-column: auto;
    }

    .metadata-item {
      grid-template-columns: 80px minmax(0, 1fr);
      font-size: 0.8rem;
    }

    .rating-panel {
      grid-column: 1 / -1;
      max-width: none;
      display: flex;
      align-items: center;
      margin-top: 4px;
    }

    .rating-stars {
      flex: 1;
      padding: 12px 8px;
      border-bottom: none;
      border-right: 1px solid #303030;
    }

    .rating-caption {
      padding: 12px;
    }

    .star {
      font-size: 1.2rem;
    }
  }

  /* Mobile */

  @media (max-width: 480px) {
    .player {
      height: 56.25vw;
      min-height: 230px;
      max-height: 70dvh;
    }

    .back {
      top: 12px;
      left: 12px;
      width: 38px;
      height: 38px;
    }

    .back svg {
      font-size: 1.35rem;
    }

    .player::before {
      height: 80px;
    }

    .player::after {
      height: 70px;
    }

    .details-section {
      padding: 18px 12px;
    }

    .details-layout {
      grid-template-columns: 95px minmax(0, 1fr);
      gap: 12px;
    }

    .details-title {
      font-size: 1rem;
      line-height: 1.35;
    }

    .details-overview {
      font-size: 0.8rem;
      line-height: 1.5;
    }

    .metadata-item {
      grid-template-columns: 70px minmax(0, 1fr);
      font-size: 0.76rem;
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
