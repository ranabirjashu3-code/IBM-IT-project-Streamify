import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    movieId: {
      type: Number,
      required: true,
    },

    mediaType: {
      type: String,
      enum: ["movie", "tv"],
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    backdrop: {
      type: String,
      default: "",
    },

    overview: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 0,
    },

    releaseDate: {
      type: String,
      default: "",
    },

    genres: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

watchlistSchema.index(
  { userId: 1, movieId: 1, mediaType: 1 },
  { unique: true }
);

const Watchlist = mongoose.model("Watchlist", watchlistSchema);

export default Watchlist;