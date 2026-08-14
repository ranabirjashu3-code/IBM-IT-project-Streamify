import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { IoPlayCircleSharp, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { AiOutlinePlus } from "react-icons/ai";
import { BsCheck } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-toastify";
import { firebaseAuth } from "../utils/firebase-config";
import { requireAuth } from "../utils/requireAuth";

export default function Hero({ items = [] }) {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isInWatchlist, setIsInWatchlist] = useState(false);

    useEffect(() => {
        if (!items || items.length === 0) return;

        const randomIndex = Math.floor(Math.random() * items.length);
        setCurrentIndex(randomIndex);
    }, [items]);

    useEffect(() => {
        if (!items || items.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [items]);

    if (!items || items.length === 0) {
        return null;
    }

    const item = items[currentIndex];

    if (!item) {
        return null;
    }

    const previousSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? items.length - 1 : prev - 1
        );
    };

    const nextSlide = () => {
        setCurrentIndex((prev) =>
            (prev + 1) % items.length
        );
    };
    //add to watchlist
    const handleWatchlist = async () => {
        if (!requireAuth(navigate)) return;

        const user = firebaseAuth.currentUser;

        if (!user) {
            toast.error("Please login to manage your watchlist.");
            return;
        }

        try {
            // REMOVE
            if (isInWatchlist) {
                await axios.delete(
                    `${import.meta.env.VITE_API_URL}/api/watchlist/${user.uid}/${item.id}/${item.mediaType}`
                );

                setIsInWatchlist(false);

                toast.success("Removed from your watchlist.");
                return;
            }

            // ADD
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/watchlist`,
                {
                    userId: user.uid,
                    movieId: item.id,
                    mediaType: item.mediaType,
                    name: item.name,
                    image: item.image,
                    backdrop: item.backdrop,
                    overview: item.overview,
                    rating: item.rating,
                    releaseDate: item.releaseDate,
                    genres: item.genres,
                }
            );

            setIsInWatchlist(true);

            toast.success("Added to your watchlist.");

        } catch (error) {
            console.error("Watchlist error:", error);

            if (error.response?.status === 409) {
                setIsInWatchlist(true);
                toast.info("Already in your watchlist.");
            } else {
                toast.error("Unable to update your watchlist.");
            }
        }
    };

    return (
        <HeroContainer
            style={{
                backgroundImage: `url(
          https://image.tmdb.org/t/p/original${item.backdrop}
        )`,
            }}
        >
            <Overlay />
            <Arrow
                className="left-arrow"
                onClick={previousSlide}
                aria-label="Previous"
            >
                <IoChevronBack />
            </Arrow>

            <Arrow
                className="right-arrow"
                onClick={nextSlide}
                aria-label="Next"
            >
                <IoChevronForward />
            </Arrow>
            <Content key={item.id}>
                <h1>{item.name}</h1>

                <Info>
                    <Rating>⭐ {item.rating?.toFixed(1)}</Rating>

                    <span>{item.releaseDate?.substring(0, 4)}</span>

                    <span>
                        {item.mediaType === "tv" ? "TV Show" : "Movie"}
                    </span>

                    {item.genres?.slice(0, 3).map((genre) => (
                        <span key={genre}>{genre}</span>
                    ))}
                </Info>

                <Overview>
                    {item.overview?.length > 220
                        ? `${item.overview.substring(0, 220)}...`
                        : item.overview}
                </Overview>

                <Buttons>
                    <button
                        className="play"
                        onClick={() => navigate("/player")}
                    >
                        <IoPlayCircleSharp />
                        Watch Now
                    </button>

                    <button className="list" onClick={handleWatchlist}>
                        {isInWatchlist ? <BsCheck /> : <AiOutlinePlus />}

                        {isInWatchlist ? "In Watchlist" : "Watchlist"}
                    </button>
                </Buttons>
            </Content>

            <Dots>
                {items.slice(0, 6).map((_, index) => (
                    <Dot
                        key={index}
                        $active={index === currentIndex}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}
            </Dots>
        </HeroContainer>
    );
}


const HeroContainer = styled.section`
  position: relative;

  width: 100%;

  /* Navbar = 72px */
  margin-top: 72px;

  /* Full remaining viewport */
  height: calc(100vh - 72px);
  min-height: 560px;

  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;

  display: flex;
  align-items: center;

  overflow: hidden;

  transition: background-image 0.6s ease;

  @media (max-width: 768px) {
    margin-top: 62px;
    height: calc(100vh - 62px);
    min-height: 500px;

    background-position: center center;
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;

  background:
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.95) 0%,
      rgba(0, 0, 0, 0.82) 25%,
      rgba(0, 0, 0, 0.55) 50%,
      rgba(0, 0, 0, 0.18) 75%,
      rgba(0, 0, 0, 0.1) 100%
    ),
    linear-gradient(
      0deg,
      #141414 0%,
      rgba(20, 20, 20, 0.85) 8%,
      transparent 38%
    );
`;

const Arrow = styled.button`
  position: absolute;

  top: 50%;
  transform: translateY(-50%);

  z-index: 20;

  width: 50px;
  height: 90px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;
  border-radius: 8px;

  background: rgba(0, 0, 0, 0.45);

  color: white;

  font-size: 2.5rem;

  cursor: pointer;

  opacity: 1;

  transition:
    background 0.25s ease,
    transform 0.25s ease;

  svg {
    pointer-events: none;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.75);
  }

  &.left-arrow {
    left: 20px;
  }

  &.right-arrow {
    right: 20px;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 70px;

    font-size: 2rem;

    &.left-arrow {
      left: 8px;
    }

    &.right-arrow {
      right: 8px;
    }
  }
`;

const Content = styled.div`
  position: relative;

  z-index: 3;

  width: 600px;
  max-width: 50%;

  margin-left: 6%;

  animation: heroFade 0.7s ease;

  @keyframes heroFade {
    from {
      opacity: 0;
      transform: translateX(-25px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  h1 {
    color: #fff;

    font-size: clamp(2.5rem, 5vw, 5rem);

    font-weight: 800;

    line-height: 1.05;

    margin: 0 0 1rem;

    text-shadow: 0 3px 15px rgba(0, 0, 0, 0.7);
  }
`;

const Info = styled.div`
  display: flex;

  align-items: center;

  flex-wrap: wrap;

  gap: 0.85rem;

  margin-bottom: 1.1rem;

  color: #ddd;

  font-size: 1rem;

  line-height: 1;

  span {
    display: inline-flex;

    align-items: center;

    line-height: 1;

    white-space: nowrap;
  }
`;

const Rating = styled.span`
  display: inline-flex !important;

  align-items: center !important;

  justify-content: center;

  gap: 0.3rem;

  color: #46d369 !important;

  font-weight: 700;

  line-height: 1 !important;

  white-space: nowrap;

  /* Keeps ⭐ and rating perfectly aligned */
  height: 20px;

  span {
    display: inline-flex;

    align-items: center;

    line-height: 1;
  }
`;

const Overview = styled.p`
  max-width: 560px;

  margin: 0 0 1.5rem;

  color: #d2d2d2;

  font-size: 1rem;

  line-height: 1.6;

  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
`;

const Buttons = styled.div`
  display: flex;

  align-items: center;

  gap: 1rem;

  button {
    display: inline-flex;

    align-items: center;

    justify-content: center;

    gap: 0.6rem;

    min-height: 48px;

    padding: 0.8rem 1.5rem;

    border: none;

    border-radius: 5px;

    font-size: 1rem;

    font-weight: 700;

    cursor: pointer;

    transition:
      transform 0.25s ease,
      background 0.25s ease;

    svg {
      font-size: 1.3rem;
    }
  }

  .play {
    background: #fff;

    color: #000;
  }

  .play:hover {
    background: #e6e6e6;

    transform: scale(1.05);
  }

  .list {
    background: rgba(80, 80, 80, 0.8);

    color: #fff;

    backdrop-filter: blur(5px);
  }

  .list:hover {
    background: rgba(110, 110, 110, 0.9);

    transform: scale(1.05);
  }
`;

const Dots = styled.div`
  position: absolute;

  z-index: 5;

  left: 6%;

  bottom: 42px;

  display: flex;

  align-items: center;

  gap: 8px;
`;

const Dot = styled.button`
  width: ${(props) => (props.$active ? "28px" : "8px")};

  height: 8px;

  padding: 0;

  border: none;

  border-radius: 10px;

  background: ${(props) =>
        props.$active
            ? "#fff"
            : "rgba(255, 255, 255, 0.4)"};

  cursor: pointer;

  transition:
    width 0.3s ease,
    background 0.3s ease;

  &:hover {
    background: #fff;
  }
`;

