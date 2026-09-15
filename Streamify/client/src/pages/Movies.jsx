import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styled from "styled-components";
import { FaPlay } from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategory, getGenres } from "../store";
import Slider from "../components/Slider";
import Hero from "../components/Hero";

export default function Movies() {
    const [isScrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const genresLoaded = useSelector((state) => state.streamify.genresLoaded);
    const movieCategories = useSelector((state) => state.streamify.movies) || {};

    const movies = [
        ...(movieCategories.trending || []),
        ...(movieCategories.nowPlaying || []),
        ...(movieCategories.popular || []),
        ...(movieCategories.topRated || []),
        ...(movieCategories.upcoming || []),
        ...(movieCategories.action || []),
        ...(movieCategories.comedy || []),
        ...(movieCategories.horror || []),
        ...(movieCategories.romance || []),
    ];

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getGenres());
    }, []);

    useEffect(() => {
        if (!genresLoaded) return;

        dispatch(
            fetchCategory({
                page: "movies",
                category: "trending",
                endpoint: "/trending/movie/day",
            })
        );

        dispatch(
            fetchCategory({
                page: "movies",
                category: "nowPlaying",
                endpoint: "/movie/now_playing",
            })
        );

        dispatch(
            fetchCategory({
                page: "movies",
                category: "popular",
                endpoint: "/movie/popular",
            })
        );

        dispatch(
            fetchCategory({
                page: "movies",
                category: "topRated",
                endpoint: "/movie/top_rated",
            })
        );

        dispatch(
            fetchCategory({
                page: "movies",
                category: "upcoming",
                endpoint: "/movie/upcoming",
            })
        );

        dispatch(
            fetchCategory({
                page: "movies",
                category: "action",
                endpoint: "/discover/movie?with_genres=28",
            })
        );

        dispatch(
            fetchCategory({
                page: "movies",
                category: "comedy",
                endpoint: "/discover/movie?with_genres=35",
            })
        );

        dispatch(
            fetchCategory({
                page: "movies",
                category: "horror",
                endpoint: "/discover/movie?with_genres=27",
            })
        );

        dispatch(
            fetchCategory({
                page: "movies",
                category: "romance",
                endpoint: "/discover/movie?with_genres=10749",
            })
        );
    }, [genresLoaded, dispatch]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <Container>
            <Navbar isScrolled={isScrolled} />
            <Hero items={movies} />
            <Slider
                sections={[
                    {
                        title: "Trending Movies",
                        data: movieCategories.trending || [],
                    },
                    {
                        title: "Now Playing",
                        data: movieCategories.nowPlaying || [],
                    },
                    {
                        title: "Popular Movies",
                        data: movieCategories.popular || [],
                    },
                    {
                        title: "Top Rated Movies",
                        data: movieCategories.topRated || [],
                    },
                    {
                        title: "Upcoming Movies",
                        data: movieCategories.upcoming || [],
                    },
                    {
                        title: "Action Movies",
                        data: movieCategories.action || [],
                    },
                    {
                        title: "Comedy Movies",
                        data: movieCategories.comedy || [],
                    },
                    {
                        title: "Horror Movies",
                        data: movieCategories.horror || [],
                    },
                    {
                        title: "Romance Movies",
                        data: movieCategories.romance || [],
                    },
                ]}
            />
            <Footer />
        </Container>
    );
}


const Container = styled.div`
  background-color: #141414;
  min-height: 100vh;
`;

