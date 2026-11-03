import tmdb from "./tmdb.js";
import { generateEmbedding } from "./embeddingService.js";
import { cosineSimilarity } from "./semanticSimilarity.js";
import { getOrCreateMovieEmbedding } from "./cacheMovieEmbedding.js";
import SemanticMovie from "../models/SemanticMovie.js";

// Fetch popular and highly rated movies from TMDB
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

// Search TMDB directly for movies matching the query
const searchTMDBMovies = async (query) => {
  try {
    const response = await tmdb.get("/search/movie", {
      params: {
        query,
        include_adult: false,
        language: "en-US",
        page: 1,
      },
    });

    return response.data.results || [];
  } catch (error) {
    console.error(
      "TMDB movie search error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// Search TMDB for movies and TV shows
const searchTMDBMulti = async (query) => {
  try {
    const response = await tmdb.get("/search/multi", {
      params: {
        query,
        include_adult: false,
        language: "en-US",
        page: 1,
      },
    });

    return (response.data.results || []).filter(
      (item) =>
        item.media_type === "movie" ||
        item.media_type === "tv"
    );
  } catch (error) {
    console.error(
      "TMDB multi-search error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// Search MongoDB for exact or partial movie title matches
const fetchTitleMatches = async (query) => {
  try {
    const escapedQuery = query.trim().replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const matches = await SemanticMovie.find({
      title: {
        $regex: escapedQuery,
        $options: "i",
      },
    })
      .limit(10)
      .lean();

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
    console.error(
      "MongoDB title search error:",
      error.message
    );

    throw error;
  }
};

// Normalize TMDB and MongoDB movie data
const normalizeMovie = (movie) => ({
  ...movie,
  id: movie.id ?? movie.tmdbId,
  tmdbId: movie.id ?? movie.tmdbId,
  title: movie.title ?? movie.name ?? "",
  overview: movie.overview ?? "",
  poster_path:
    movie.poster_path ?? movie.posterPath ?? null,
  backdrop_path:
    movie.backdrop_path ?? movie.backdropPath ?? null,
  release_date:
    movie.release_date ??
    movie.releaseDate ??
    movie.first_air_date ??
    null,
  vote_average:
    movie.vote_average ?? movie.rating ?? 0,
  genre_ids:
    movie.genre_ids ?? movie.genres ?? [],
});

// Perform hybrid semantic search
export const discoverMovies = async (query) => {
  if (!query?.trim()) {
    return [];
  }

  try {
    const cleanQuery = query.trim();

    // 1. Search MongoDB and TMDB in parallel
    const [
      titleMatches,
      searchedTMDBMovies,
      multiSearchResults,
      popularTMDBMovies,
    ] = await Promise.all([
      fetchTitleMatches(cleanQuery),
      searchTMDBMovies(cleanQuery),
      searchTMDBMulti(cleanQuery),
      fetchCandidateMovies(),
    ]);

    // 2. Combine all candidates and remove duplicates
    const combinedMovies = [
      ...new Map(
        [
          ...titleMatches,
          ...searchedTMDBMovies,
          ...multiSearchResults,
          ...popularTMDBMovies,
        ]
          .map(normalizeMovie)
          .filter((movie) => movie.id)
          .map((movie) => [movie.id, movie])
      ).values(),
    ];

    // 3. Generate embedding for the query
    const queryEmbedding = await generateEmbedding(
      cleanQuery
    );

    // 4. Generate/reuse embeddings and calculate similarity
    const scoredMovies = await Promise.all(
      combinedMovies
        .filter((movie) => movie.overview.trim())
        .map(async (movie) => {
          const movieEmbedding =
            await getOrCreateMovieEmbedding(movie);

          const score = cosineSimilarity(
            queryEmbedding,
            movieEmbedding
          );

          const titleMatchesQuery = movie.title
            .toLowerCase()
            .includes(cleanQuery.toLowerCase());

          return {
            id: movie.id,
            tmdbId: movie.id,
            title: movie.title,
            overview: movie.overview,
            posterPath: movie.poster_path,
            backdropPath: movie.backdrop_path,
            releaseDate: movie.release_date,
            rating: movie.vote_average,
            genres: movie.genre_ids,
            score: Number.isFinite(score) ? score : 0,
            titleMatchesQuery,
          };
        })
    );

    // 5. Prioritize title matches, then semantic similarity
    scoredMovies.sort((a, b) => {
      if (a.titleMatchesQuery && !b.titleMatchesQuery) {
        return -1;
      }

      if (!a.titleMatchesQuery && b.titleMatchesQuery) {
        return 1;
      }

      return b.score - a.score;
    });

    // 6. Remove duplicate movies
    const uniqueMovies = [
      ...new Map(
        scoredMovies.map((movie) => [
          movie.tmdbId,
          movie,
        ])
      ).values(),
    ];

    // 7. Filter weak semantic matches
    const MIN_SIMILARITY = 0.30;

    const relevantMovies = uniqueMovies.filter(
      (movie) =>
        movie.titleMatchesQuery ||
        movie.score >= MIN_SIMILARITY
    );

    // 8. Return the top 10 results
    return relevantMovies.slice(0, 10);
  } catch (error) {
    console.error(
      "Dynamic hybrid search error:",
      error.response?.data || error.message
    );

    throw error;
  }
};