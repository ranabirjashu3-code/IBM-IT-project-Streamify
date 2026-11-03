import tmdb from "./tmdb.js";
import { generateEmbedding } from "./embeddingService.js";
import { cosineSimilarity } from "./semanticSimilarity.js";
import { getOrCreateMovieEmbedding } from "./cacheMovieEmbedding.js";
import SemanticMovie from "../models/SemanticMovie.js";

// Fetch candidate movies dynamically from TMDB
const fetchCandidateMovies = async () => {
  try {
    const requests = [
      // Popular movies: 5 pages
      ...[1, 2, 3, 4, 5].map((page) =>
        tmdb.get("/discover/movie", {
          params: {
            include_adult: false,
            language: "en-US",
            sort_by: "popularity.desc",
            page,
          },
        })
      ),

      // Highly rated movies: 3 pages
      ...[1, 2, 3].map((page) =>
        tmdb.get("/discover/movie", {
          params: {
            include_adult: false,
            language: "en-US",
            sort_by: "vote_average.desc",
            "vote_count.gte": 100,
            page,
          },
        })
      ),
    ];

    const responses = await Promise.all(requests);

    const movies = responses.flatMap(
      (response) => response.data.results || []
    );

    // Remove duplicates by TMDB ID
    return [
      ...new Map(
        movies.map((movie) => [movie.id, movie])
      ).values(),
    ];
  } catch (error) {
    console.error(
      "TMDB candidate retrieval error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// Search MongoDB for exact or partial title matches
const fetchTitleMatches = async (query) => {
  try {
    const matches = await SemanticMovie.find({
      title: {
        $regex: query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      },
    })
      .limit(10)
      .lean();

    // Convert MongoDB documents to TMDB-like movie objects
    return matches.map((movie) => ({
      id: movie.tmdbId,
      tmdbId: movie.tmdbId,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.posterPath,
      backdrop_path: movie.backdropPath,
      release_date: movie.releaseDate,
      vote_average: movie.rating,
      genre_ids: movie.genres || [],
    }));
  } catch (error) {
    console.error("MongoDB title search error:", error.message);
    throw error;
  }
};

// Perform hybrid search
export const discoverMovies = async (query) => {
  if (!query?.trim()) {
    return [];
  }

  try {
    const cleanQuery = query.trim();

    // 1. Search MongoDB for exact/partial title matches
    const titleMatches = await fetchTitleMatches(cleanQuery);

    // 2. Fetch candidate movies dynamically from TMDB
    const tmdbMovies = await fetchCandidateMovies();

    // 3. Merge title matches and TMDB candidates
    const combinedMovies = [
      ...new Map(
        [...titleMatches, ...tmdbMovies].map((movie) => [
          movie.id ?? movie.tmdbId,
          movie,
        ])
      ).values(),
    ];

    // 4. Generate embedding for the user's query
    const queryEmbedding = await generateEmbedding(cleanQuery);

    // 5. Generate/reuse movie embeddings and calculate similarity
    const scoredMovies = await Promise.all(
      combinedMovies
        .filter((movie) => movie.overview?.trim())
        .map(async (movie) => {
          const movieEmbedding =
            await getOrCreateMovieEmbedding(movie);

          const score = cosineSimilarity(
            queryEmbedding,
            movieEmbedding
          );

          // Check whether the movie title matches the query
          const titleMatchesQuery = movie.title
            ?.toLowerCase()
            .includes(cleanQuery.toLowerCase());

          return {
            id: movie.id ?? movie.tmdbId,
            tmdbId: movie.id ?? movie.tmdbId,
            title: movie.title,
            overview: movie.overview,
            posterPath:
              movie.poster_path ?? movie.posterPath,
            backdropPath:
              movie.backdrop_path ?? movie.backdropPath,
            releaseDate:
              movie.release_date ?? movie.releaseDate,
            rating:
              movie.vote_average ?? movie.rating,
            genres:
              movie.genre_ids ?? movie.genres ?? [],
            score: Number.isFinite(score) ? score : 0,
            titleMatchesQuery,
          };
        })
    );

    // 6. Prioritize title matches, then semantic similarity
    scoredMovies.sort((a, b) => {
      if (a.titleMatchesQuery && !b.titleMatchesQuery) {
        return -1;
      }

      if (!a.titleMatchesQuery && b.titleMatchesQuery) {
        return 1;
      }

      return b.score - a.score;
    });

    // 7. Remove duplicates
    const uniqueMovies = [
      ...new Map(
        scoredMovies.map((movie) => [movie.tmdbId, movie])
      ).values(),
    ];

    // 8. Keep exact title matches or sufficiently relevant semantic matches
    const MIN_SIMILARITY = 0.30;

    const relevantMovies = uniqueMovies.filter(
      (movie) =>
        movie.titleMatchesQuery ||
        movie.score >= MIN_SIMILARITY
    );

    // 9. Return the top 10 results
    return relevantMovies.slice(0, 10);
  } catch (error) {
    console.error(
      "Dynamic hybrid search error:",
      error.response?.data || error.message
    );

    throw error;
  }
};