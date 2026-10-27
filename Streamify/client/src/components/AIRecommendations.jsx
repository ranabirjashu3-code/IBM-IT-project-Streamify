
import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { onAuthStateChanged } from "firebase/auth";

import { firebaseAuth } from "../Utils/firebase-config";
import { API_URL } from "../Utils/api";
import CardSlider from "./CardSlider";

export default function AIRecommendations() {
  const [user, setUser] = useState(firebaseAuth.currentUser);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Listen for Firebase login/logout changes
  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  // Fetch recommendations from the backend
  useEffect(() => {
    if (!user) {
      setMovies([]);
      setError("");
      return;
    }

    let active = true;

    async function loadRecommendations() {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `${API_URL}/api/recommendations/ai/${encodeURIComponent(
            user.uid
          )}`
        );

        if (!active) return;

        // Our current backend returns a "results" array
        const results = Array.isArray(response.data.results)
          ? response.data.results
          : [];

        // Convert TMDB data into Streamify Card format
        const formattedMovies = results
          .filter((item) => item.id && (item.poster_path || item.image))
          .map((item) => ({
            id: item.id,

            mediaType:
              item.media_type ||
              item.mediaType ||
              (item.first_air_date || item.name
                ? "tv"
                : "movie"),

            name: item.title || item.name || "Untitled",

            image: item.poster_path || item.image || "",

            backdrop:
              item.backdrop_path || item.backdrop || "",

            overview: item.overview || "",

            rating: Number(
              item.vote_average ?? item.rating ?? 0
            ),

            releaseDate:
              item.release_date ||
              item.first_air_date ||
              item.releaseDate ||
              "",

            language:
              item.original_language || item.language || "",

            genres: Array.isArray(item.genres)
              ? item.genres
                  .map((genre) =>
                    typeof genre === "string"
                      ? genre
                      : genre.name
                  )
                  .filter(Boolean)
              : [],
          }));

        setMovies(formattedMovies);
      } catch (err) {
        console.error(
          "Recommendation loading error:",
          err.response?.data || err.message
        );

        if (active) {
          setError(
            "Unable to load recommendations. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      active = false;
    };
  }, [user]);

  // Show recommendations only to signed-in users
  if (!user) return null;

  return (
    <Section>
      <Header>
        <div>
          <Eyebrow>PERSONALIZED FOR YOU</Eyebrow>
          <Title>AI Picks For You ✦</Title>
          <Description>
            Discover movies and shows selected for your interests.
          </Description>
        </div>
      </Header>

      {loading && (
        <Status>Finding your next favorite...</Status>
      )}

      {!loading && error && (
        <Status>{error}</Status>
      )}

      {!loading && !error && movies.length > 0 && (
        <CardSlider
          title="Recommended for you"
          data={movies}
        />
      )}

      {!loading && !error && movies.length === 0 && (
        <Status>
          No recommendations available yet. Try again after
          watching a movie or adding a title to your watchlist.
        </Status>
      )}
    </Section>
  );
}

const Section = styled.section`
  position: relative;
  z-index: 1;
  padding: 1.5rem 0 1rem;
  background: #141414;
  color: #fff;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 1.8rem 1rem;

  @media (max-width: 600px) {
    margin: 0 1rem 1rem;
  }
`;

const Eyebrow = styled.div`
  color: #a78bfa;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  margin-bottom: 0.4rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: clamp(1.3rem, 2vw, 1.7rem);
  font-weight: 750;
`;

const Description = styled.p`
  color: #b8b8b8;
  font-size: 0.9rem;
  margin: 0.5rem 0 0;
`;

const Status = styled.p`
  color: #b8b8b8;
  margin: 1.2rem 1.8rem;
  font-size: 0.95rem;
`;
