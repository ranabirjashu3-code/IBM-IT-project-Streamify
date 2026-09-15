import express from "express";
import WatchHistory from "../models/WatchHistory.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("🔥 WATCH HISTORY ROUTE HIT");
    console.log("BODY:", req.body);

    const {
      firebaseUid,
      movieId,
      title,
      posterPath,
      watchedTime,
      duration,
    } = req.body;

    if (!firebaseUid) {
      return res.status(401).json({
        message: "User not logged in",
      });
    }

    if (!movieId) {
      return res.status(400).json({
        message: "Movie ID is required",
      });
    }

    const history = await WatchHistory.findOneAndUpdate(
      {
        firebaseUid: firebaseUid,
        movieId: movieId,
      },
      {
        firebaseUid: firebaseUid,
        movieId: movieId,
        title: title,
        posterPath: posterPath,
        watchedTime: watchedTime,
        duration: duration,
        lastWatched: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    console.log("✅ Watch history saved:", history);

    res.status(200).json(history);

  } catch (error) {
    console.error("❌ Watch history error:", error);

    res.status(500).json({
      message: "Failed to save watch history",
      error: error.message,
    });
  }
});

router.get("/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const history = await WatchHistory.find({
      firebaseUid: firebaseUid,
      $expr: {
        $lt: ["$watchedTime", "$duration"],
      },
    })
      .sort({ lastWatched: -1 })
      .limit(10);

    res.status(200).json(history);

  } catch (error) {
    console.error("❌ Failed to fetch watch history:", error);

    res.status(500).json({
      message: "Failed to fetch watch history",
    });
  }
});

router.delete("/:firebaseUid/:movieId", async (req, res) => {
  try {
    const { firebaseUid, movieId } = req.params;

    console.log("🗑️ Removing watch history:", {
      firebaseUid,
      movieId,
    });

    const deletedMovie = await WatchHistory.findOneAndDelete({
      firebaseUid,
      movieId,
    });

    if (!deletedMovie) {
      return res.status(404).json({
        message: "Movie not found in watch history",
      });
    }

    console.log("✅ Watch history removed:", deletedMovie.title);

    res.status(200).json({
      message: "Movie removed from continue watching",
    });

  } catch (error) {
    console.error("❌ Delete watch history error:", error);

    res.status(500).json({
      message: "Failed to remove movie",
      error: error.message,
    });
  }
});

export default router;