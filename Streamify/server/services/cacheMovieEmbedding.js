import SemanticMovie from "../models/SemanticMovie.js";
import { generateEmbedding } from "./embeddingService.js";
import tmdb from "./tmdb.js";

// Fetch movie cast from TMDB
const fetchMovieCredits = async (movieId) => {
  try {
    const response = await tmdb.get(`/movie/${movieId}/credits`);

    return (response.data.cast || [])
      .slice(0, 20)
      .map((person) => person.name)
      .filter(Boolean);
  } catch (error) {
    console.error(
      `TMDB credits error for movie ${movieId}:`,
      error.response?.data || error.message
    );

    return [];
  }
};

// Generate or retrieve a movie embedding
export const getOrCreateMovieEmbedding = async (movie) => {
  const movieId = movie.id ?? movie.tmdbId;

  if (!movieId) {
    throw new Error("Movie ID is required to create an embedding");
  }

  // Check whether the movie already exists in MongoDB
  const existingMovie = await SemanticMovie.findOne({
    tmdbId: movieId,
  }).lean();

  // Reuse cached embedding if it exists
  if (existingMovie?.embedding?.length) {
    return existingMovie.embedding;
  }

  // Get cast names from TMDB
  const castNames = await fetchMovieCredits(movieId);

  // Include title, overview, and cast names in embedding text
  const movieTitle = movie.title ?? movie.name ?? "";
  const movieOverview = movie.overview ?? "";

  const movieText = `
    Title: ${movieTitle}
    Overview: ${movieOverview}
    Cast: ${castNames.join(", ")}
  `;

  // Generate embedding
  const embedding = await generateEmbedding(movieText);

  // Store movie metadata and embedding
  await SemanticMovie.findOneAndUpdate(
    { tmdbId: movieId },
    {
      $set: {
        tmdbId: movieId,
        title: movieTitle,
        overview: movieOverview,
        genres: (movie.genre_ids ?? movie.genres ?? []).map(String),
        posterPath:
          movie.poster_path ?? movie.posterPath ?? "",
        backdropPath:
          movie.backdrop_path ?? movie.backdropPath ?? "",
        releaseDate:
          movie.release_date ?? movie.releaseDate ?? "",
        rating:
          movie.vote_average ?? movie.rating ?? 0,
        cast: castNames,
        embedding,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  return embedding;
};