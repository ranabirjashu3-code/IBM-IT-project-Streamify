
import express from "express";
import axios from "axios";

import { generateEmbedding } from "../services/embeddingService.js";
import SemanticMovie from "../models/SemanticMovie.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const queryEmbedding = await generateEmbedding(q);

    const movies = await SemanticMovie.aggregate([
      {
        $vectorSearch: {
          index: "semantic_movie_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 10,
        },
      },
      {
        $project: {
          tmdbId: 1,
          title: 1,
          overview: 1,
          genres: 1,
          posterPath: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    // Fetch additional movie details from TMDB
    const enrichedMovies = await Promise.all(
      movies.map(async (movie) => {
        try {
          const { data } = await axios.get(
            `https://api.themoviedb.org/3/movie/${movie.tmdbId}`,
            {
              params: {
                api_key: process.env.TMDB_API_KEY,
              },
            }
          );

          return {
            id: data.id,
            tmdbId: data.id,
            mediaType: "movie",
            title: data.title,
            name: data.title,
            overview: data.overview || movie.overview,
            genres: movie.genres,
            posterPath: data.poster_path || movie.posterPath,
            image: data.poster_path || movie.posterPath,
            backdrop: data.backdrop_path,
            rating: data.vote_average,
            releaseDate: data.release_date,
            language: data.original_language,
            votes: data.vote_count,
            score: movie.score,
          };
        } catch (error) {
          console.error(
            `TMDB details error for ${movie.tmdbId}:`,
            error.response?.data || error.message
          );

          // Return stored movie data if TMDB lookup fails
          return {
            id: movie.tmdbId,
            tmdbId: movie.tmdbId,
            mediaType: "movie",
            title: movie.title,
            name: movie.title,
            overview: movie.overview,
            genres: movie.genres,
            posterPath: movie.posterPath,
            image: movie.posterPath,
            score: movie.score,
          };
        }
      })
    );

    res.json(enrichedMovies);
  } catch (error) {
    console.error("Semantic search error:", error);

    res.status(500).json({
      message: "Semantic search failed",
    });
  }
});

export default router;
