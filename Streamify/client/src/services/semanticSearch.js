
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/semantic-search`;

export const searchMoviesSemantically = async (query) => {
  const response = await axios.get(API_URL, {
    params: { q: query },
  });

  return response.data.map((movie) => ({
    id: movie.tmdbId,
    mediaType: "movie",
    name: movie.title,
    image: movie.posterPath,
    backdrop: movie.backdropPath || null,
    overview: movie.overview,
    genres: movie.genres || [],
    score: movie.score,
  }));
};