
import express from "express";
import tmdb from "../services/tmdb.js";
import WatchHistory from "../models/WatchHistory.js";
import Watchlist from "../models/watchlist.js";

const router = express.Router();

// GET personalized movie and TV recommendations
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === "undefined") {
      return res.status(400).json({
        message: "Valid user ID is required",
      });
    }

    // Step 1: Load the user's activity from MongoDB
    const [history, watchlist] = await Promise.all([
      WatchHistory.find({
        firebaseUid: userId,
      })
        .sort({ lastWatched: -1 })
        .limit(10)
        .lean(),

      Watchlist.find({
        userId,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Step 2: Build a list of titles to use as recommendation seeds
    const seeds = [
      ...watchlist.map((item) => ({
        id: item.movieId,
        mediaType: item.mediaType,
        title: item.name,
      })),

      ...history.map((item) => ({
        id: item.movieId,
        mediaType: "movie",
        title: item.title,
      })),
    ];

    // Avoid processing the same title multiple times
    const uniqueSeeds = [
      ...new Map(
        seeds.map((item) => [
          `${item.mediaType}-${item.id}`,
          item,
        ])
      ).values(),
    ].slice(0, 5);

    // Step 3: New users receive trending content
    if (uniqueSeeds.length === 0) {
      const response = await tmdb.get(
        "/trending/all/week"
      );

      return res.json({
        personalized: false,
        message:
          "Save or watch titles to personalize your recommendations.",
        results: response.data.results || [],
      });
    }

    // Step 4: Ask TMDB for similar titles
    const responses = await Promise.allSettled(
      uniqueSeeds.map((item) =>
        tmdb.get(
          `/${item.mediaType}/${item.id}/recommendations`,
          { params: { page: 1 } }
        )
      )
    );

    // Step 5: Combine recommendations from all seed titles
    const candidates = new Map();

    responses.forEach((response, index) => {
      if (response.status !== "fulfilled") {
        console.error(
          "Recommendation request failed:",
          response.reason?.message
        );
        return;
      }

      const seed = uniqueSeeds[index];
      const results = response.value.data.results || [];

      results.forEach((item) => {
        const mediaType =
          item.media_type || seed.mediaType;

        const key = `${mediaType}-${item.id}`;

        if (!candidates.has(key)) {
          candidates.set(key, {
            ...item,
            media_type: mediaType,
            recommendationScore: 0,
            recommendedBecause: [],
          });
        }

        const candidate = candidates.get(key);

        candidate.recommendationScore += 1;
        candidate.recommendedBecause.push(seed.title);
      });
    });

    // Step 6: Exclude titles the user already knows
    const excludedIds = new Set(
      seeds.map(
        (item) => `${item.mediaType}-${item.id}`
      )
    );

    // Step 7: Rank results by relevance and rating
    const results = [...candidates.values()]
      .filter(
        (item) =>
          !excludedIds.has(
            `${item.media_type}-${item.id}`
          )
      )
      .sort((a, b) => {
        const scoreA =
          a.recommendationScore * 10 +
          (a.vote_average || 0);

        const scoreB =
          b.recommendationScore * 10 +
          (b.vote_average || 0);

        return scoreB - scoreA;
      })
      .slice(0, 20);

    return res.json({
      personalized: true,
      results,
    });
  } catch (error) {
    console.error(
      "AI recommendation error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Failed to load recommendations",
    });
  }
});

export default router;
