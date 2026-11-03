import express from "express";
import { discoverMovies } from "../services/tmdbService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(400).json({
        message: "Search query is required.",
      });
    }

    const movies = await discoverMovies(query);

    return res.status(200).json(movies);
  } catch (error) {
    console.error(
      "Semantic search route error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Dynamic semantic search failed.",
    });
  }
});

export default router;