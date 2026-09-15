import axios from "axios";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

const tmdb = axios.create({
    baseURL: process.env.TMDB_BASE_URL,
    timeout: 30000,

    params: {
        api_key: process.env.TMDB_API_KEY,
    },

    httpsAgent: new https.Agent({
        family: 4,
    }),
});

console.log(
    "TMDB BASE URL:",
    process.env.TMDB_BASE_URL
);

console.log(
    "TMDB KEY EXISTS:",
    Boolean(process.env.TMDB_API_KEY)
);

export default tmdb;