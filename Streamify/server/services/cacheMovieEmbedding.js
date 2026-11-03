import SemanticMovie from "../models/SemanticMovie.js";
import { generateEmbedding } from "./embeddingService.js";

export const getOrCreateMovieEmbedding = async (movie) => {
  const existingMovie = await SemanticMovie.findOne({
    tmdbId: movie.id,
  }).lean();

  if (existingMovie?.embedding?.length) {
    return existingMovie.embedding;
  }

  const movieText = `Title: ${movie.title} Overview: ${movie.overview}`;
  const embedding = await generateEmbedding(movieText);

  await SemanticMovie.findOneAndUpdate(
    { tmdbId: movie.id },
    {
      $set: {
        tmdbId: movie.id,
        title: movie.title,
        overview: movie.overview || "",
        genres: (movie.genre_ids || []).map(String),
        posterPath: movie.poster_path || "",
        embedding,
      },
    },
    { upsert: true, new: true }
  );

  return embedding;
}; 