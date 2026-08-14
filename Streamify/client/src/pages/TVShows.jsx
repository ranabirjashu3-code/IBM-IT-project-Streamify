import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Slider from "../components/Slider";
import Footer from "../components/Footer";
import { getGenres, fetchCategory } from "../store";
import styled from "styled-components";
import Hero from "../components/Hero";

export default function TVShows() {
  const [isScrolled, setScrolled] = useState(false);

  const dispatch = useDispatch();

  const genresLoaded = useSelector(
    (state) => state.streamify.genresLoaded
  );
const tv = useSelector((state) => state.streamify.tv) || {};
  const tvShows = [
  ...(tv?.trending || []),
  ...(tv?.popular || []),
  ...(tv?.topRated || []),
  ...(tv?.airingToday || []),
  ...(tv?.onTheAir || []),
  ...(tv?.actionAdventure || []),
  ...(tv?.drama || []),
  ...(tv?.crime || []),
];

  useEffect(() => {
    dispatch(getGenres());
  }, [dispatch]);

  useEffect(() => {
    if (!genresLoaded) return;

    dispatch(
      fetchCategory({
        page: "tv",
        category: "trending",
        endpoint: "/trending/tv/day",
      })
    );

    dispatch(
      fetchCategory({
        page: "tv",
        category: "popular",
        endpoint: "/tv/popular",
      })
    );

    dispatch(
      fetchCategory({
        page: "tv",
        category: "topRated",
        endpoint: "/tv/top_rated",
      })
    );

    dispatch(
      fetchCategory({
        page: "tv",
        category: "airingToday",
        endpoint: "/tv/airing_today",
      })
    );

    dispatch(
      fetchCategory({
        page: "tv",
        category: "onTheAir",
        endpoint: "/tv/on_the_air",
      })
    );

    dispatch(
      fetchCategory({
        page: "tv",
        category: "actionAdventure",
        endpoint: "/discover/tv?with_genres=10759",
      })
    );

    dispatch(
      fetchCategory({
        page: "tv",
        category: "drama",
        endpoint: "/discover/tv?with_genres=18",
      })
    );

    dispatch(
      fetchCategory({
        page: "tv",
        category: "crime",
        endpoint: "/discover/tv?with_genres=80",
      })
    );

  }, [genresLoaded, dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
  <Container>
    <Navbar isScrolled={isScrolled} />

    <Hero items={tvShows} />

    <Slider
      sections={[
        {
          title: "Trending TV Shows",
          data: tv.trending || [],
        },
        {
          title: "Popular TV Shows",
          data: tv.popular || [],
        },
        {
          title: "Top Rated TV Shows",
          data: tv.topRated || [],
        },
        {
          title: "Airing Today",
          data: tv.airingToday || [],
        },
        {
          title: "On The Air",
          data: tv.onTheAir || [],
        },
        {
          title: "Action & Adventure",
          data: tv.actionAdventure || [],
        },
        {
          title: "Drama",
          data: tv.drama || [],
        },
        {
          title: "Crime",
          data: tv.crime || [],
        },
      ]}
    />

    <Footer />
  </Container>
);
}

const Container = styled.div`
  background: #141414;
  min-height: 100vh;
`;