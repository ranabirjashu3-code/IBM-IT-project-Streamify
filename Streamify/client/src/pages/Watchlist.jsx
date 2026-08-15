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
  width: 100%;
  min-height: 100vh;

  box-sizing: border-box;

  padding: 100px clamp(20px, 4vw, 60px) 50px;

  background: #0b0b0b;

  color: #ffffff;

  overflow-x: hidden;

  /* =====================================================
     HEADER
  ===================================================== */

  ${Header} {
    width: 100%;
    max-width: 1800px;

    margin: 0 auto 35px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;
  }

  ${Header} h1 {
    margin: 0;

    color: #ffffff;

    font-size: clamp(1.7rem, 3vw, 2.8rem);

    font-weight: 800;

    line-height: 1.2;
  }

  ${Header} button {
    padding: 10px 18px;

    border: 1px solid rgba(255, 255, 255, 0.15);

    border-radius: 7px;

    background: rgba(255, 255, 255, 0.08);

    color: #ffffff;

    font-size: 0.9rem;

    font-weight: 600;

    cursor: pointer;

    white-space: nowrap;

    transition:
      background 0.25s ease,
      border-color 0.25s ease,
      transform 0.2s ease;
  }

  ${Header} button:hover {
    background: #46d369;

    border-color: #46d369;

    color: #000000;

    transform: translateY(-2px);
  }

  /* =====================================================
     GRID
  ===================================================== */

  ${Grid} {
    width: 100%;
    max-width: 1800px;

    margin: 0 auto;

    display: grid;

    grid-template-columns: repeat(
      auto-fill,
      minmax(220px, 1fr)
    );

    gap: clamp(18px, 2vw, 30px);
  }

  /* =====================================================
     MOVIE CARD
  ===================================================== */

  ${Card} {
    width: 100%;

    min-width: 0;

    overflow: hidden;

    background: #151515;

    border: 1px solid rgba(255, 255, 255, 0.06);

    border-radius: 12px;

    box-shadow:
      0 8px 25px rgba(0, 0, 0, 0.35);

    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease,
      border-color 0.3s ease;
  }

  ${Card}:hover {
    transform: translateY(-7px);

    border-color: rgba(70, 211, 105, 0.3);

    box-shadow:
      0 15px 40px rgba(0, 0, 0, 0.6);
  }

  /* =====================================================
     POSTER
  ===================================================== */

  ${Card} > img {
    display: block;

    width: 100%;

    aspect-ratio: 2 / 3;

    object-fit: cover;

    background: #1a1a1a;

    transition: transform 0.4s ease;
  }

  ${Card}:hover > img {
    transform: scale(1.025);
  }

  /* =====================================================
     CARD INFO
  ===================================================== */

  ${Card} .info {
    display: flex;

    flex-direction: column;

    gap: 11px;

    padding: 15px;
  }

  ${Card} .info h3 {
    margin: 0;

    color: #ffffff;

    font-size: clamp(0.95rem, 1.2vw, 1.15rem);

    font-weight: 700;

    line-height: 1.3;

    display: -webkit-box;

    -webkit-line-clamp: 2;

    -webkit-box-orient: vertical;

    overflow: hidden;
  }

  /* =====================================================
     META
  ===================================================== */

  ${Card} .meta {
    display: flex;

    align-items: center;

    flex-wrap: wrap;

    gap: 8px;

    color: rgba(255, 255, 255, 0.65);

    font-size: 0.8rem;
  }

  ${Card} .meta span {
    display: inline-flex;

    align-items: center;

    white-space: nowrap;
  }

  /* =====================================================
     DESCRIPTION
  ===================================================== */

  ${Card} .info p {
    margin: 0;

    color: rgba(255, 255, 255, 0.58);

    font-size: 0.85rem;

    line-height: 1.5;

    display: -webkit-box;

    -webkit-line-clamp: 3;

    -webkit-box-orient: vertical;

    overflow: hidden;
  }

  /* =====================================================
     BUTTONS
  ===================================================== */

  ${Card} .buttons {
    display: flex;

    gap: 8px;

    width: 100%;

    margin-top: auto;
  }

  ${Card} .buttons button {
    flex: 1;

    min-width: 0;

    min-height: 38px;

    padding: 8px 10px;

    border: none;

    border-radius: 6px;

    background: #46d369;

    color: #000000;

    font-size: 0.82rem;

    font-weight: 700;

    cursor: pointer;

    transition:
      background 0.25s ease,
      transform 0.2s ease;
  }

  ${Card} .buttons button:hover {
    background: #5ee27c;

    transform: translateY(-1px);
  }

  ${Card} .buttons button.remove {
    background: rgba(255, 255, 255, 0.1);

    color: #ffffff;

    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  ${Card} .buttons button.remove:hover {
    background: #e50914;

    border-color: #e50914;

    color: #ffffff;
  }

  /* =====================================================
     EMPTY WATCHLIST
  ===================================================== */

  ${Empty} {
    min-height: 55vh;

    width: 100%;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    text-align: center;

    padding: 30px 15px;

    box-sizing: border-box;
  }

  ${Empty} h2 {
    margin: 0 0 12px;

    color: #ffffff;

    font-size: clamp(1.4rem, 3vw, 2.2rem);

    font-weight: 700;
  }

  ${Empty} p {
    max-width: 550px;

    margin: 0 0 25px;

    color: rgba(255, 255, 255, 0.6);

    font-size: clamp(0.85rem, 1.3vw, 1rem);

    line-height: 1.6;
  }

  ${Empty} button {
    padding: 11px 22px;

    border: none;

    border-radius: 7px;

    background: #46d369;

    color: #000000;

    font-size: 0.9rem;

    font-weight: 700;

    cursor: pointer;

    transition:
      background 0.25s ease,
      transform 0.2s ease;
  }

  ${Empty} button:hover {
    background: #5ee27c;

    transform: translateY(-2px);
  }

  /* =====================================================
     LARGE DESKTOP
     1600px+
  ===================================================== */

  @media (min-width: 1600px) {
    padding-top: 115px;

    ${Grid} {
      grid-template-columns: repeat(
        auto-fill,
        minmax(230px, 1fr)
      );

      gap: 30px;
    }
  }

  /* =====================================================
     DESKTOP
     1200px - 1599px
  ===================================================== */

  @media (max-width: 1400px) {
    ${Grid} {
      grid-template-columns: repeat(
        5,
        minmax(0, 1fr)
      );

      gap: 22px;
    }
  }

  /* =====================================================
     LAPTOP
     1024px - 1199px
  ===================================================== */

  @media (max-width: 1200px) {
    padding-left: 30px;
    padding-right: 30px;

    ${Grid} {
      grid-template-columns: repeat(
        4,
        minmax(0, 1fr)
      );

      gap: 20px;
    }
  }

  /* =====================================================
     TABLET
     768px - 1023px
  ===================================================== */

  @media (max-width: 1024px) {
    padding-top: 90px;

    padding-left: 22px;
    padding-right: 22px;

    ${Header} {
      margin-bottom: 28px;
    }

    ${Grid} {
      grid-template-columns: repeat(
        3,
        minmax(0, 1fr)
      );

      gap: 18px;
    }

    ${Card} .info {
      padding: 12px;
    }

    ${Card} .buttons button {
      font-size: 0.75rem;
    }
  }

  /* =====================================================
     MOBILE
     768px
  ===================================================== */

  @media (max-width: 768px) {
    padding-top: 82px;

    padding-left: 16px;
    padding-right: 16px;

    padding-bottom: 40px;

    ${Header} {
      margin-bottom: 22px;

      gap: 12px;
    }

    ${Header} h1 {
      font-size: 1.65rem;
    }

    ${Header} button {
      padding: 8px 13px;

      font-size: 0.78rem;
    }

    ${Grid} {
      grid-template-columns: repeat(
        2,
        minmax(0, 1fr)
      );

      gap: 14px;
    }

    ${Card} {
      border-radius: 9px;
    }

    ${Card} .info {
      padding: 10px;

      gap: 8px;
    }

    ${Card} .info h3 {
      font-size: 0.85rem;
    }

    ${Card} .meta {
      font-size: 0.7rem;

      gap: 5px;
    }

    ${Card} .info p {
      font-size: 0.72rem;

      line-height: 1.4;

      -webkit-line-clamp: 2;
    }

    ${Card} .buttons {
      gap: 6px;
    }

    ${Card} .buttons button {
      min-height: 34px;

      padding: 6px 7px;

      font-size: 0.7rem;
    }
  }

  /* =====================================================
     SMALL MOBILE
     480px
  ===================================================== */

  @media (max-width: 480px) {
    padding-top: 75px;

    padding-left: 10px;
    padding-right: 10px;

    ${Header} {
      margin-bottom: 18px;
    }

    ${Header} h1 {
      font-size: 1.4rem;
    }

    ${Header} button {
      padding: 7px 10px;

      font-size: 0.7rem;
    }

    ${Grid} {
      grid-template-columns: repeat(
        2,
        minmax(0, 1fr)
      );

      gap: 10px;
    }

    ${Card} {
      border-radius: 7px;
    }

    ${Card} .info {
      padding: 8px;

      gap: 6px;
    }

    ${Card} .info h3 {
      font-size: 0.74rem;
    }

    ${Card} .meta {
      font-size: 0.62rem;

      gap: 4px;
    }

    ${Card} .info p {
      font-size: 0.65rem;

      -webkit-line-clamp: 2;
    }

    ${Card} .buttons {
      flex-direction: column;

      gap: 5px;
    }

    ${Card} .buttons button {
      width: 100%;

      min-height: 30px;

      font-size: 0.65rem;
    }
  }

  /* =====================================================
     VERY SMALL PHONES
     360px
  ===================================================== */

  @media (max-width: 360px) {
    padding-top: 72px;

    padding-left: 8px;
    padding-right: 8px;

    ${Header} h1 {
      font-size: 1.25rem;
    }

    ${Header} button {
      padding: 6px 8px;

      font-size: 0.65rem;
    }

    ${Grid} {
      gap: 8px;
    }

    ${Card} .info {
      padding: 7px;
    }

    ${Card} .info h3 {
      font-size: 0.68rem;
    }

    ${Card} .meta {
      font-size: 0.58rem;
    }

    ${Card} .info p {
      font-size: 0.6rem;
    }

    ${Card} .buttons button {
      min-height: 28px;

      font-size: 0.6rem;
    }
  }
`;