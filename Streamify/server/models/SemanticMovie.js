
import mongoose from "mongoose";

const semanticMovieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
    unique: true,
  },

  title: {
    type: String,
    required: true,
  },

  overview: {
    type: String,
    default: "",
  },

  genres: {
    type: [String],
    default: [],
  },

  posterPath: {
    type: String,
    default: "",
  },

  embedding: {
    type: [Number],
    required: true,
  },

  cast: {
  type: [String],
  default: [],
},
});

const SemanticMovie = mongoose.model(
  "SemanticMovie",
  semanticMovieSchema
);

export default SemanticMovie;
