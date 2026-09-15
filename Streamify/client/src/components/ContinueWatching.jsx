import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { firebaseAuth } from "../Utils/firebase-config";

export default function ContinueWatching() {
    const navigate = useNavigate();

    const [movies, setMovies] = useState([]);

    useEffect(() => {
        const fetchContinueWatching = async () => {
            try {
                const user = firebaseAuth.currentUser;

                if (!user) {
                    console.log("No logged-in user");
                    return;
                }

                const response = await axios.get(
                    `http://localhost:8080/api/watch-history/${user.uid}`
                );

                console.log("Continue Watching:", response.data);

                setMovies(response.data);
            } catch (error) {
                console.error(
                    "Failed to fetch continue watching:",
                    error
                );
            }
        };

        fetchContinueWatching();
    }, []);

    if (movies.length === 0) {
        return null;
    }

    const removeFromContinueWatching = async (movieId) => {
        try {
            const user = firebaseAuth.currentUser;

            if (!user) {
                console.log("❌ User not logged in");
                return;
            }

            await axios.delete(
                `http://localhost:8080/api/watch-history/${user.uid}/${movieId}`
            );

            // Remove immediately from UI
            setMovies((prevMovies) =>
                prevMovies.filter(
                    (movie) => movie.movieId !== movieId
                )
            );

            console.log("✅ Removed from Continue Watching");

        } catch (error) {
            console.error(
                "❌ Failed to remove from Continue Watching:",
                error
            );
        }
    };

    return (
        <Container>
            <Title>Continue Watching</Title>

            <MovieRow>
                {movies.map((movie) => {
                    const progress =
                        movie.duration > 0
                            ? Math.min(
                                (movie.watchedTime / movie.duration) * 100,
                                100
                            )
                            : 0;

                    return (
                        <MovieCard
                            key={movie.movieId}
                            onClick={() => {
                                navigate("/player", {
                                    state: {
                                        movie: movie,
                                        watchedTime: movie.watchedTime,
                                    },
                                });
                            }}
                        >
                            <RemoveButton
                                onClick={(e) => {
                                    e.stopPropagation();

                                    removeFromContinueWatching(movie.movieId);
                                }}
                                title="Remove from Continue Watching"
                            >
                                ×
                            </RemoveButton>

                            {/* Poster */}
                            {movie.posterPath ? (
                                <Poster
                                    src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                                    alt={movie.title}
                                />
                            ) : (
                                <PosterPlaceholder>
                                    No Poster
                                </PosterPlaceholder>
                            )}

                            <PlayButton
                                onClick={(e) => {
                                    e.stopPropagation();

                                    navigate("/player", {
                                        state: {
                                            movie: movie,
                                            watchedTime: movie.watchedTime,
                                        },
                                    });
                                }}
                                title="Resume watching"
                            >
                                ▶
                            </PlayButton>

                            {/* Progress */}
                            <ProgressContainer>
                                <ProgressBar
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />
                            </ProgressContainer>

                            {/* Title */}
                            <MovieTitle>
                                {movie.title}
                            </MovieTitle>

                            <ProgressText>
                                {Math.round(progress)}% watched
                            </ProgressText>

                        </MovieCard>
                    );
                })}
            </MovieRow>
        </Container>
    );
}

const Container = styled.section`
  width: 100%;
  padding: 0.5rem 1rem 0.5rem;
  box-sizing: border-box;
  background: #111;
`;

const Title = styled.h2`
  margin: 0 0 0.8rem;

  color: #fff;

  font-family: Arial, sans-serif;
  font-size: 1.8rem;
  font-weight: 700;

  letter-spacing: -0.3px;
`;

const MovieRow = styled.div`
  display: flex;
  align-items: flex-start;

  gap: 1.25rem;

  width: 100%;

  overflow-x: auto;
  overflow-y: visible;

  padding: 0;

  box-sizing: border-box;

  scroll-behavior: smooth;

  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const RemoveButton = styled.button`
  position: absolute;

  top: 12px;
  right: 9px;

  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 10;

  border: none;
  border-radius: 50%;

  background: rgba(0, 0, 0, 0.75);
  color: #fff;

  font-size: 22px;
  line-height: 1;

  cursor: pointer;

  opacity: 0;
  transform: scale(0.9);

  transition:
    opacity 0.25s ease,
    transform 0.25s ease,
    background 0.25s ease;
`;

const MovieCard = styled.div`
  position: relative;

  width: 190px;
  min-width: 190px;

  cursor: pointer;

  border-radius: 8px;

  background: #181818;

  overflow: visible;

  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.06);

    z-index: 20;

    box-shadow:
      0 12px 30px rgba(0, 0, 0, 0.65);

    ${RemoveButton} {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const Poster = styled.img`
  width: 100%;
  height: 240px;

  display: block;

  object-fit: cover;

  background: #493d3d;

  border-radius: 8px 8px 0 0;

  transition: transform 0.35s ease;

  ${MovieCard}:hover & {
    transform: scale(1.03);
  }
`;

const PosterPlaceholder = styled.div`
  width: 100%;
  height: 270px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(
    145deg,
    #242424,
    #181818
  );

  color: #777;

  font-family: Arial, sans-serif;
  font-size: 0.9rem;

  border-radius: 8px 8px 0 0;
`;

const ProgressContainer = styled.div`
  position: relative;

  width: 100%;
  height: 4px;

  background: #555;

  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;

  background: #e50914;

  border-radius: 0 3px 3px 0;

  transition: width 0.4s ease;
`;

const MovieTitle = styled.h3`
  margin: 0;
  padding: 0.7rem 0.8rem 0.15rem;

  color: #fff;

  font-family: Arial, sans-serif;
  font-size: 0.95rem;
  font-weight: 600;

  line-height: 1.3;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProgressText = styled.p`
  margin: 0;
  padding: 0 0.8rem 0.75rem;

  color: #999;

  font-family: Arial, sans-serif;
  font-size: 0.78rem;
  font-weight: 400;
`;

const PlayButton = styled.button`
  position: absolute;

  top: 50%;
  left: 50%;

  width: 58px;
  height: 58px;

  display: flex;
  align-items: center;
  justify-content: center;

  /* Perfect center */
  transform: translate(-50%, -50%) scale(0.85);

  border: 2px solid rgba(255, 255, 255, 0.95);
  border-radius: 50%;

  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);

  color: #fff;

  font-size: 24px;
  line-height: 1;

  padding: 0;
  padding-left: 3px;

  cursor: pointer;

  opacity: 0;

  z-index: 8;

  transition:
    opacity 0.25s ease,
    transform 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;

  /* Show when card is hovered */
  ${MovieCard}:hover & {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  /* Play button hover */
  &:hover {
    background: rgba(229, 9, 20, 0.9);

    border-color: #fff;

    transform: translate(-50%, -50%) scale(1.1);

    box-shadow:
      0 0 0 4px rgba(255, 255, 255, 0.12),
      0 8px 25px rgba(0, 0, 0, 0.6);
  }

  &:active {
    transform: translate(-50%, -50%) scale(0.95);
  }
`;