import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { firebaseAuth } from "../Utils/firebase-config";
import { toast } from "react-toastify";
import { requireAuth } from "../Utils/requireAuth";

export default function Watchlist() {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const getWatchlist = async () => {
            const user = firebaseAuth.currentUser;

            if (!user) {
                toast.error("Please login to view your watchlist.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/watchlist/${user.uid}`
                );

                setWatchlist(response.data);
            } catch (error) {
                console.error("Watchlist error:", error);
                toast.error("Unable to load your watchlist.");
            } finally {
                setLoading(false);
            }
        };

        getWatchlist();
    }, []);

    const removeFromWatchlist = async (movie) => {
        const user = firebaseAuth.currentUser;

        if (!user) return;

        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/watchlist/${user.uid}/${movie.movieId}/${movie.mediaType}`
            );

            setWatchlist((prev) =>
                prev.filter(
                    (item) =>
                        !(
                            item.movieId === movie.movieId &&
                            item.mediaType === movie.mediaType
                        )
                )
            );

            toast.success("Removed from watchlist.");
        } catch (error) {
            console.error("Remove error:", error);
            toast.error("Unable to remove from watchlist.");
        }
    };

    if (loading) {
        return <Message>Loading your watchlist...</Message>;
    }

    return (
        <Container>
            <Header>
                <h1>My Watchlist</h1>

                <button onClick={() => navigate("/")}>
                    Back to Home
                </button>
            </Header>

            {watchlist.length === 0 ? (
                <Empty>
                    <h2>Your watchlist is empty</h2>
                    <p>
                        Add movies and TV shows to your watchlist and they will appear
                        here.
                    </p>

                    <button onClick={() => {
                        if (!requireAuth(navigate)) return;
                         navigate("/")
                    }}>
                        Browse Movies
                    </button>
                </Empty>
            ) : (
                <Grid>
                    {watchlist.map((movie) => (
                        <Card key={`${movie.mediaType}-${movie.movieId}`}>
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.image}`}
                                alt={movie.name}
                            />

                            <div className="info">
                                <h3>{movie.name}</h3>

                                <div className="meta">
                                    <span>⭐ {movie.rating?.toFixed(1)}</span>

                                    <span>
                                        {movie.releaseDate?.substring(0, 4)}
                                    </span>

                                    <span>
                                        {movie.mediaType === "tv" ? "TV" : "Movie"}
                                    </span>
                                </div>

                                <p>
                                    {movie.overview?.length > 100
                                        ? `${movie.overview.substring(0, 100)}...`
                                        : movie.overview}
                                </p>

                                <div className="buttons">
                                    <button
                                        onClick={() => navigate("/player")}
                                    >
                                        ▶ Play
                                    </button>

                                    <button
                                        className="remove"
                                        onClick={() => removeFromWatchlist(movie)}
                                    >
                                        ✓ Remove
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </Grid>
            )}
        </Container>
    );
}


const Container = styled.div`
  min-height: 100vh;
  background: #141414;
  color: white;
  padding: 100px 5rem 50px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
  }

  button {
    background: white;
    color: black;
    border: none;
    padding: 0.7rem 1.3rem;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: #181818;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.25s ease;

  &:hover {
    transform: scale(1.04);
  }

  img {
    width: 100%;
    height: 270px;
    object-fit: cover;
    display: block;
  }

  .info {
    padding: 1rem;
  }

  h3 {
    margin: 0 0 0.6rem;
    font-size: 1rem;
  }

  .meta {
    display: flex;
    gap: 0.6rem;
    color: #aaa;
    font-size: 0.8rem;
    margin-bottom: 0.7rem;
  }

  .meta span:first-child {
    color: #46d369;
  }

  p {
    color: #bbb;
    font-size: 0.85rem;
    line-height: 1.4;
    margin-bottom: 1rem;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
  }

  button {
    border: none;
    border-radius: 4px;
    padding: 0.5rem 0.7rem;
    cursor: pointer;
    font-weight: 600;
  }

  button:first-child {
    background: white;
    color: black;
  }

  .remove {
    background: #333;
    color: white;
  }

  .remove:hover {
    background: #555;
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 8rem 1rem;

  h2 {
    font-size: 1.8rem;
  }

  p {
    color: #aaa;
    margin-bottom: 2rem;
  }

  button {
    background: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
  }
`;

const Message = styled.div`
  min-height: 100vh;
  background: #141414;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;