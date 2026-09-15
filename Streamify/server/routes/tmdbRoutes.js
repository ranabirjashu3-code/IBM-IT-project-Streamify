import express from "express";
import tmdb from "../services/tmdb.js";

const router = express.Router();


// ========================================
// ALLOWED TMDB PATHS
// ========================================

const allowedPaths = [
    "/trending/all/day",
    "/trending/movie/day",
    "/trending/tv/day",

    "/movie/now_playing",
    "/movie/popular",
    "/movie/top_rated",
    "/movie/upcoming",

    "/tv/popular",
    "/tv/top_rated",
    "/tv/airing_today",
    "/tv/on_the_air",

    "/discover/movie",
    "/discover/tv",
];


// ========================================
// GENRES
// ========================================

router.get("/genres/movie", async (req, res) => {
    try {
        const response = await tmdb.get("/genre/movie/list");

        res.json(response.data);
    } catch (error) {
        console.error(
            "TMDB Movie Genre Error:",
            error.response?.data || error.message
        );

        res.status(error.response?.status || 500).json({
            message: "Failed to fetch movie genres",
        });
    }
});


router.get("/genres/tv", async (req, res) => {
    try {
        const response = await tmdb.get("/genre/tv/list");

        res.json(response.data);
    } catch (error) {
        console.error(
            "TMDB TV Genre Error:",
            error.response?.data || error.message
        );

        res.status(error.response?.status || 500).json({
            message: "Failed to fetch TV genres",
        });
    }
});


// ========================================
// CATEGORY
// ========================================

router.get("/category", async (req, res) => {
    try {
        const {
            endpoint,
            page = 1,
        } = req.query;

        if (!endpoint) {
            return res.status(400).json({
                message: "TMDB endpoint is required",
            });
        }


        // Parse endpoint + query parameters
        const parsedUrl = new URL(
            endpoint,
            "https://api.themoviedb.org"
        );

        const path = parsedUrl.pathname;


        // Security check
        if (!allowedPaths.includes(path)) {
            return res.status(400).json({
                message: "Invalid TMDB endpoint",
            });
        }


        // Get query parameters from endpoint
        const tmdbParams = {};

        parsedUrl.searchParams.forEach(
            (value, key) => {
                tmdbParams[key] = value;
            }
        );


        // Add pagination
        tmdbParams.page = page;


        console.log(
            "TMDB Request:",
            path,
            tmdbParams
        );


        const response = await tmdb.get(
            path,
            {
                params: tmdbParams,
            }
        );


        res.json(response.data);

    } catch (error) {

        console.error(
            "TMDB Category Error:",
            error.response?.data ||
            error.message
        );

        res.status(
            error.response?.status || 500
        ).json({
            message: "Failed to fetch TMDB data",
        });
    }
});


export default router;