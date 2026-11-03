import dns from "node:dns";

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

import "dotenv/config";
import axios from "axios";
import mongoose from "mongoose";

import SemanticMovie from "../models/SemanticMovie.js";
import { generateEmbedding } from "../services/embeddingService.js";

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: process.env.TMDB_API_KEY,
  },
});

const indexMovies = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("MongoDB connected");

  const genreResponse = await tmdb.get(
    "/genre/movie/list"
  );

  const genreMap = new Map(
    genreResponse.data.genres.map((genre) => [
      genre.id,
      genre.name,
    ])
  );

  for (let page = 1; page <= 2; page++) {
    const response = await tmdb.get("/movie/popular", {
      params: { page },
    });

    for (const movie of response.data.results) {
      if (!movie.overview?.trim()) continue;

      const genres = (movie.genre_ids || [])
        .map((id) => genreMap.get(id))
        .filter(Boolean);

      const text = `
        Title: ${movie.title}.
        Overview: ${movie.overview}.
        Genres: ${genres.join(", ")}.
      `;

      const embedding = await generateEmbedding(text);

      await SemanticMovie.updateOne(
        { tmdbId: movie.id },
        {
          $set: {
            tmdbId: movie.id,
            title: movie.title,
            overview: movie.overview,
            genres,
            posterPath: movie.poster_path,
            embedding,
          },
        },
        { upsert: true }
      );

      console.log(`Indexed: ${movie.title}`);
    }
  }

  console.log("Movie indexing completed");
};

try {
  await indexMovies();
} catch (error) {
  console.error("Indexing error:", error.message);
  console.error("Error code:", error.code);
  console.error("Full error:", error.stack);
} finally {
  await mongoose.disconnect();
}
