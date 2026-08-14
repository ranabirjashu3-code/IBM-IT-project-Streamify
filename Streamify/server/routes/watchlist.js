import express from "express";
import Watchlist from "../models/watchlist.js";

const router = express.Router();

// Add to watchlist
router.post("/", async (req, res) => {
  try {
    const watchlistItem = await Watchlist.create(req.body);

    res.status(201).json(watchlistItem);
  } catch (error) {
    console.error("Watchlist error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Already in watchlist",
      });
    }

    res.status(500).json({
      message: "Failed to add to watchlist",
    });
  }
});


// Check if movie is already in watchlist
router.get(
  "/check/:userId/:movieId/:mediaType",
  async (req, res) => {
    try {
      const { userId, movieId, mediaType } = req.params;

      const item = await Watchlist.findOne({
        userId,
        movieId: Number(movieId),
        mediaType,
      });

      res.json({
        isInWatchlist: !!item,
      });

    } catch (error) {
      console.error("Watchlist check error:", error);

      res.status(500).json({
        message: "Failed to check watchlist",
      });
    }
  }
);


// Get user's watchlist
router.get("/:userId", async (req, res) => {
  try {
    const watchlist = await Watchlist.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json(watchlist);
  } catch (error) {
    console.error("Get watchlist error:", error);

    res.status(500).json({
      message: "Failed to get watchlist",
    });
  }
});


// Remove from watchlist
router.delete(
  "/:userId/:movieId/:mediaType",
  async (req, res) => {
    try {
      const { userId, movieId, mediaType } = req.params;

      const deletedItem = await Watchlist.findOneAndDelete({
        userId,
        movieId: Number(movieId),
        mediaType,
      });

      if (!deletedItem) {
        return res.status(404).json({
          message: "Movie not found in watchlist",
        });
      }

      res.json({
        message: "Removed from watchlist",
      });

    } catch (error) {
      console.error("Delete watchlist error:", error);

      res.status(500).json({
        message: "Failed to remove from watchlist",
      });
    }
  }
);

export default router;