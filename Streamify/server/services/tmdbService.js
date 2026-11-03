import tmdb from "./tmdb.js";
import { generateEmbedding } from "./embeddingService.js";
import { cosineSimilarity } from "./semanticSimilarity.js";
import { getOrCreateMovieEmbedding } from "./cacheMovieEmbedding.js";

// Fetch candidate movies dynamically from TMDB
// Fetch a broader candidate pool from TMDB
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

    // Remove duplicate movies by TMDB ID
    const uniqueMovies = [
      ...new Map(
        movies.map((movie) => [movie.id, movie])
      ).values(),
    ];

    return uniqueMovies;
  } catch (error) {
    console.error(
      "TMDB candidate retrieval error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// Perform semantic ranking
export const discoverMovies = async (query) => {
  if (!query?.trim()) {
    return [];
  }

  try {
    // 1. Fetch candidate movies from TMDB
    const movies = await fetchCandidateMovies();

    // 2. Generate embedding for the user's query
    const queryEmbedding = await generateEmbedding(query.trim());

    // 3. Get cached movie embeddings and calculate similarity
    const scoredMovies = await Promise.all(
      movies
        .filter((movie) => movie.overview?.trim())
        .map(async (movie) => {
          // Reuse MongoDB embedding or create it if missing
          const movieEmbedding =
            await getOrCreateMovieEmbedding(movie);

          const score = cosineSimilarity(
            queryEmbedding,
            movieEmbedding
          );

          return {
            id: movie.id,
            tmdbId: movie.id,
            title: movie.title,
            overview: movie.overview,
            posterPath: movie.poster_path,
            backdropPath: movie.backdrop_path,
            releaseDate: movie.release_date,
            rating: movie.vote_average,
            genres: movie.genre_ids || [],
            score,
          };
        })
    );

    // 4. Sort by semantic similarity
    scoredMovies.sort((a, b) => b.score - a.score);

    // 5. Remove duplicates and invalid similarity scores
    const uniqueMovies = [
      ...new Map(
        scoredMovies.map((movie) => [movie.tmdbId, movie])
      ).values(),
    ];

    // 6. Filter out weak or invalid matches
    const MIN_SIMILARITY = 0.30;

    const relevantMovies = uniqueMovies.filter(
      (movie) =>
        Number.isFinite(movie.score) &&
        movie.score >= MIN_SIMILARITY
    );

    // 7. Return the top 10 relevant matches
    return relevantMovies.slice(0, 10);
  } catch (error) {
    console.error(
      "Dynamic semantic search error:",
      error.response?.data || error.message
    );

    throw error;
  }
};