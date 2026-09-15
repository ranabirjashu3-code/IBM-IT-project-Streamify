import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
    },

    movieId: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    posterPath: {
      type: String,
      default: "",
    },

    watchedTime: {
      type: Number,
      default: 0,
    },

    duration: {
      type: Number,
      default: 0,
    },

    lastWatched: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

watchHistorySchema.index(
  { firebaseUid: 1, movieId: 1 },
  { unique: true }
);

const WatchHistory = mongoose.model(
  "WatchHistory",
  watchHistorySchema
);

export default WatchHistory;