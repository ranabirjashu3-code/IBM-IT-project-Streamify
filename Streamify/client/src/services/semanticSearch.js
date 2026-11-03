import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/semantic-search`;

export const searchMoviesSemantically = async (query) => {
  const response = await axios.get(API_URL, {
    params: {
      q: query,
    },
  });

  return response.data;
};