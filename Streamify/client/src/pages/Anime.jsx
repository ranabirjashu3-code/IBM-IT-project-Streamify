import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Slider from "../components/Slider";
import { getGenres, fetchCategory } from "../store";
import styled from "styled-components";
import Hero from "../components/Hero";

export default function Anime() {
    const [isScrolled, setScrolled] = useState(false);

    const dispatch = useDispatch();

    const genresLoaded = useSelector(
        (state) => state.streamify.genresLoaded
    );

    const anime = useSelector((state) => state.streamify.anime) || {};
    const animeItems = [
    ...(anime.trending || []),
    ...(anime.topRated || []),
    ...(anime.airing || []),
    ...(anime.action || []),
    ...(anime.comedy || []),
    ...(anime.drama || []),
    ...(anime.fantasy || []),
];

    useEffect(() => {
        dispatch(getGenres());
    }, [dispatch]);

    useEffect(() => {
        if (!genresLoaded) return;

        dispatch(
            fetchCategory({
                page: "anime",
                category: "trending",
                endpoint:
                    "/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc",
            })
        );

        dispatch(
            fetchCategory({
                page: "anime",
                category: "topRated",
                endpoint:
                    "/discover/tv?with_genres=16&with_origin_country=JP&sort_by=vote_average.desc",
            })
        );

        dispatch(
            fetchCategory({
                page: "anime",
                category: "airing",
                endpoint:
                    "/discover/tv?with_genres=16&with_origin_country=JP&with_status=0",
            })
        );

        dispatch(
            fetchCategory({
                page: "anime",
                category: "action",
                endpoint:
                    "/discover/tv?with_genres=16,10759&with_origin_country=JP",
            })
        );

        dispatch(
            fetchCategory({
                page: "anime",
                category: "comedy",
                endpoint:
                    "/discover/tv?with_genres=16,35&with_origin_country=JP",
            })
        );

        dispatch(
            fetchCategory({
                page: "anime",
                category: "drama",
                endpoint:
                    "/discover/tv?with_genres=16,18&with_origin_country=JP",
            })
        );

        dispatch(
            fetchCategory({
                page: "anime",
                category: "fantasy",
                endpoint:
                    "/discover/tv?with_genres=16,10765&with_origin_country=JP",
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

        <Hero items={animeItems} />

        <Slider
            sections={[
                {
                    title: "Trending Anime",
                    data: anime.trending || [],
                },
                {
                    title: "Top Rated Anime",
                    data: anime.topRated || [],
                },
                {
                    title: "Airing Anime",
                    data: anime.airing || [],
                },
                {
                    title: "Action Anime",
                    data: anime.action || [],
                },
                {
                    title: "Comedy Anime",
                    data: anime.comedy || [],
                },
                {
                    title: "Drama Anime",
                    data: anime.drama || [],
                },
                {
                    title: "Fantasy Anime",
                    data: anime.fantasy || [],
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