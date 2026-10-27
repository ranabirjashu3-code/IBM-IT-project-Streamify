import express from "express";
import tmdb from "../services/tmdb.js";

const router = express.Router();



router.get(
    "/recommendations/:mediaType/:id",
    async (req, res) => {
        try {
            const { mediaType, id } = req.params;

            // Allow movies and TV shows only
            if (!["movie", "tv"].includes(mediaType)) {
                return res.status(400).json({
                    message: "Media type must be movie or tv",
                });
            }

            // Validate the TMDB ID
            if (!/^\d+$/.test(id) || Number(id) <= 0) {
                return res.status(400).json({
                    message: "A valid TMDB ID is required",
                });
            }

            // Fetch recommendations for the selected title
            const response = await tmdb.get(
                `/${mediaType}/${id}/recommendations`,
                {
                    params: { page: 1 },
                }
            );

            return res.json(response.data);
        } catch (error) {
            console.error(
                "Player Recommendation Error:",
                error.response?.data || error.message
            );

            return res.status(
                error.response?.status || 500
            ).json({
                message: "Failed to fetch recommendations",
            });
        }
    }
);


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
    "/search/multi",
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
