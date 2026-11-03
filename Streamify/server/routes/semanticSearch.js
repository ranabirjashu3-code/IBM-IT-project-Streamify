import express from "express";
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

    res.json(movies);
  } catch (error) {
    console.error("Semantic search error:", error);
    res.status(500).json({
      message: "Semantic search failed",
    });
  }
});

export default router;