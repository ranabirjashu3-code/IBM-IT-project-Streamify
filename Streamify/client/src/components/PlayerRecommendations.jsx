
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

export default function PlayerRecommendations({ movie }) {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const movieId = movie?.id ?? movie?.movieId;

  const mediaType =
    movie?.mediaType ||
    movie?.media_type ||
    (movie?.first_air_date ? "tv" : "movie");

  useEffect(() => {
    if (!movieId || !API_URL) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSimilarTitles() {
      setLoading(true);
      setError("");
      setItems([]);

      try {
        // Fetch titles similar to the currently playing title only.
        const response = await axios.get(
          `${API_URL}/api/tmdb/recommendations/${mediaType}/${movieId}`
        );

        if (cancelled) return;

        const results = response.data?.results || [];

        const formattedItems = results
          .filter(
            (item) =>
              String(item.id) !== String(movieId) &&
              item.poster_path
          )
          .map((item) => ({
            ...item,
            id: item.id,
            mediaType: item.media_type || mediaType,
            name:
              item.title ||
              item.name ||
              item.original_title ||
              item.original_name ||
              "Untitled",
            image: item.poster_path,
            backdrop: item.backdrop_path || "",
            overview: item.overview || "",
            rating: Number(item.vote_average || 0),
            releaseDate:
              item.release_date ||
              item.first_air_date ||
              "",
            language: item.original_language || "",
          }));

        setItems(formattedItems.slice(0, 10));
      } catch (err) {
        console.error(
          "Failed to fetch similar titles:",
          err.response?.data || err.message
        );

        if (!cancelled) {
          setError("Unable to load similar titles.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSimilarTitles();

    return () => {
      cancelled = true;
    };
  }, [movieId, mediaType, API_URL]);

  if (!movieId) return null;

  return (
    <Container>
      <Eyebrow>RELATED CONTENT</Eyebrow>

      <Heading>More Like This</Heading>

      <Subtitle>
        Similar to{" "}
        {movie?.name || movie?.title || "the current title"}
      </Subtitle>

      {loading && (
        <Status>Finding similar titles...</Status>
      )}

      {!loading && error && (
        <Status>{error}</Status>
      )}

      {!loading && !error && items.length === 0 && (
        <Status>No similar titles found.</Status>
      )}

      <List>
        {items.map((item) => (
          <Recommendation
            key={`${item.mediaType}-${item.id}`}
            type="button"
            onClick={() =>
              navigate("/player", {
                state: { movie: item },
              })
            }
          >
            <Poster
              src={`https://image.tmdb.org/t/p/w185${item.image}`}
              alt={item.name}
              loading="lazy"
            />

            <Details>
              <Name>{item.name}</Name>

              <Meta>
                ★ {item.rating.toFixed(1)}
                {item.releaseDate &&
                  ` · ${item.releaseDate.slice(0, 4)}`}
              </Meta>

              <Overview>{item.overview}</Overview>
            </Details>
          </Recommendation>
        ))}
      </List>
    </Container>
  );
}

const Container = styled.aside`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 18px;
  background: #111;
  border: 1px solid #262626;
  border-radius: 14px;
  color: #fff;
`;

const Eyebrow = styled.p`
  margin: 0 0 6px;
  color: #b9a0ff;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.13em;
`;

const Heading = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.35;
`;

const Subtitle = styled.p`
  margin: 7px 0 18px;
  color: #a8a8a8;
  font-size: 0.82rem;
  line-height: 1.5;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Recommendation = styled.button`
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr);
  align-items: start;
  gap: 12px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;

  &:hover h3 {
    color: #c2adff;
  }

  &:focus-visible {
    outline: 2px solid #b9a0ff;
    outline-offset: 4px;
    border-radius: 5px;
  }
`;

const Poster = styled.img`
  display: block;
  width: 70px;
  height: 105px;
  object-fit: cover;
  border-radius: 7px;
  background: #222;
`;

const Details = styled.div`
  min-width: 0;
  padding-top: 3px;
`;

const Name = styled.h3`
  margin: 0 0 7px;
  font-size: 0.9rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
`;

const Meta = styled.p`
  margin: 0 0 8px;
  color: #c2adff;
  font-size: 0.77rem;
`;

const Overview = styled.p`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin: 0;
  color: #a5a5a5;
  font-size: 0.76rem;
  line-height: 1.5;
`;

const Status = styled.p`
  margin: 12px 0;
  color: #aaa;
  font-size: 0.85rem;
  line-height: 1.5;
`;
