
import dns from "node:dns";

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

import "dotenv/config";
import mongoose from "mongoose";

import tmdb from "../services/tmdb.js";
import SemanticMovie from "../models/SemanticMovie.js";
import { getOrCreateMovieEmbedding } from "../services/cacheMovieEmbedding.js";

const TOTAL_PAGES = 20;

const buildMovieCatalog = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    // Connect to MongoDB before querying the database
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");
    console.log("Starting movie catalog creation...");

    for (let page = 1; page <= TOTAL_PAGES; page++) {
      console.log(`Fetching TMDB page ${page}/${TOTAL_PAGES}`);

      const response = await tmdb.get("/discover/movie", {
        params: {
          include_adult: false,
          language: "en-US",
          sort_by: "popularity.desc",
          page,
        },
      });

      const movies = response.data.results || [];

      for (const movie of movies) {
        if (!movie.overview?.trim()) {
          continue;
        }

        await getOrCreateMovieEmbedding(movie);

        console.log(`Cached: ${movie.title}`);
      }
    }

    const totalMovies = await SemanticMovie.countDocuments();

    console.log("Catalog creation completed.");
    console.log(`Movies in MongoDB: ${totalMovies}`);
  } catch (error) {
    console.error(
      "Catalog creation failed:",
      error.response?.data || error.message
    );
  } finally {
    // Close the database connection when the script finishes
    await mongoose.disconnect();
  }
};

buildMovieCatalog();
