import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Slider from "../components/Slider";
import { getGenres, fetchCategory } from "../store";
import styled from "styled-components";
import Footer from "../components/Footer";
import Hero from "../components/Hero";


export default function Home() {
  const [isScrolled, setScrolled] = useState(false);
  const dispatch = useDispatch();
  const genresLoaded = useSelector(
    (state) => state.streamify.genresLoaded
  );

 const home = useSelector((state) => state.streamify.home) || {};
 const heroItems = [
  ...(home.trending || []),
  ...(home.nowPlaying || []),
  ...(home.popularMovies || []),
  ...(home.popularTV || []),
  ...(home.topRatedMovies || []),
  ...(home.topRatedTV || []),
  ...(home.actionMovies || []),
  ...(home.anime || []),
];

  useEffect(() => {
    dispatch(getGenres());
  }, [dispatch]);

  useEffect(() => {
    if (!genresLoaded) return;

    dispatch(fetchCategory({
      page: "home",
      category: "trending",
      endpoint: "/trending/all/day",
    }));

    dispatch(fetchCategory({
      page: "home",
      category: "nowPlaying",
      endpoint: "/movie/now_playing",
    }));

    dispatch(fetchCategory({
      page: "home",
      category: "popularMovies",
      endpoint: "/movie/popular",
    }));

    dispatch(fetchCategory({
      page: "home",
      category: "popularTV",
      endpoint: "/tv/popular",
    }));

    dispatch(fetchCategory({
      page: "home",
      category: "topRatedMovies",
      endpoint: "/movie/top_rated",
    }));

    dispatch(fetchCategory({
      page: "home",
      category: "topRatedTV",
      endpoint: "/tv/top_rated",
    }));

    dispatch(fetchCategory({
      page: "home",
      category: "actionMovies",
      endpoint: "/discover/movie?with_genres=28",
    }));

    dispatch(fetchCategory({
      page: "home",
      category: "anime",
      endpoint: "/discover/tv?with_genres=16",
    }));
  }, [genresLoaded, dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

 return (
  <Container>
    <Navbar isScrolled={isScrolled} />

    <Hero items={heroItems} />

    <Slider
      sections={[
        {
          title: "Trending Now",
          data: home.trending || [],
        },
        {
          title: "New Releases",
          data: home.nowPlaying || [],
        },
        {
          title: "Popular Movies",
          data: home.popularMovies || [],
        },
        {
          title: "Popular TV Shows",
          data: home.popularTV || [],
        },
        {
          title: "Top Rated Movies",
          data: home.topRatedMovies || [],
        },
        {
          title: "Top Rated TV Shows",
          data: home.topRatedTV || [],
        },
        {
          title: "Action Movies",
          data: home.actionMovies || [],
        },
        {
          title: "Anime",
          data: home.anime || [],
        },
      ]}
    />

    <Footer />
  </Container>
);
}

const Container = styled.div`
  background: #000;
  color: #fff;
  overflow-x: hidden;

  .hero {
    position: relative;
    height: 100vh;
    width: 100%;
    overflow: hidden;
  }
.movies {
  min-height: 150vh;
  background: #141414;
}
  /* Background */
  .hero-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transform: scale(1.05);
    transition: transform 8s ease;
    z-index: 0;
  }

  .hero:hover .hero-image {
    transform: scale(1.1);
  }

  /* Netflix-style Overlay */
  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.95) 0%,
      rgba(0, 0, 0, 0.75) 20%,
      rgba(0, 0, 0, 0.45) 45%,
      rgba(0, 0, 0, 0.25) 65%,
      rgba(0, 0, 0, 0.8) 100%
    );
    z-index: 1;
  }

  /* Bottom Fade */
  .hero::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 18rem;
    background: linear-gradient(
      to top,
      #000 0%,
      rgba(0, 0, 0, 0.85) 35%,
      transparent 100%
    );
    z-index: 2;
  }

  /* Content */
  .content {
    position: absolute;
    top: 58%;
    left: 5rem;
    transform: translateY(-50%);
    z-index: 3;
  }

  .hero-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 520px;
  }

  /* Logo */
  .title-image {
    width: 420px;
    max-width: 100%;
    object-fit: contain;
  }

  /* Description */
  .description {
    color: #d2d2d2;
    font-size: 1.1rem;
    line-height: 1.7;
    max-width: 520px;
  }

  /* Buttons */
  .buttons {
    display: flex;
    gap: 1rem;
  }

  .play-btn,
  .info-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;

    padding: 0.95rem 2rem;

    border: none;
    border-radius: 4px;

    font-size: 1rem;
    font-weight: 700;

    cursor: pointer;

    transition: all 0.25s ease;
  }

  .play-btn {
    background: #fff;
    color: #000;
  }

  .play-btn:hover {
    background: rgb(220,220,220);
    transform: scale(1.05);
  }

  .info-btn {
    background: rgba(109,109,110,.75);
    color: #fff;
  }

  .info-btn:hover {
    background: rgba(109,109,110,.55);
    transform: scale(1.05);
  }

  .icon {
    font-size: 1.25rem;
  }

  /* Responsive */
  @media (max-width: 992px) {
    .content {
      left: 3rem;
      top: 55%;
    }

    .title-image {
      width: 320px;
    }

    .description {
      font-size: 1rem;
      max-width: 420px;
    }
  }

 /* Large desktop */
@media (min-width: 1440px) {
  .content {
    left: 7rem;
    max-width: 750px;
  }
}

/* Laptop / desktop */
@media (min-width: 1024px) and (max-width: 1439px) {
  .content {
    left: 5vw;
    max-width: 650px;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1023px) {
  .content {
    left: 5vw;
    top: 52%;
    width: 85%;
    max-width: 600px;
  }
}
  /* Mobile */
@media (max-width: 768px) {
  .content {
    left: 50%;
    top: 52%;
    transform: translate(-50%, -50%);

    width: 90%;
    max-width: 500px;

    text-align: center;
  }
}

/* Small mobile */
@media (max-width: 480px) {
  .content {
    top: 54%;
    width: 92%;
  }
}

    .title-image {
      width: 240px;
    }

    .description {
      font-size: 0.95rem;
      max-width: 100%;
    }

    .buttons {
      flex-direction: column;
      align-items: flex-start;
    }

    .play-btn,
    .info-btn {
      width: 220px;
    }
      
  }
`;