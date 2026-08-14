import {
    configureStore,
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";
import { API_KEY, TMDB_BASE_URL } from "../Utils/constants";
import axios from "axios";

const initialState = {
    genres: {},
    genresLoaded: false,

    home: {},

    movies: {},

    tv: {},

    anime: {},
};

export const getGenres = createAsyncThunk(
    "streamify/genres",
    async () => {
        const [movieRes, tvRes] = await Promise.all([
            axios.get(`${TMDB_BASE_URL}/genre/movie/list?api_key=${API_KEY}`),
            axios.get(`${TMDB_BASE_URL}/genre/tv/list?api_key=${API_KEY}`),
        ]);

        const genreMap = {};

        [...movieRes.data.genres, ...tvRes.data.genres].forEach((genre) => {
            genreMap[genre.id] = genre.name;
        });

        return genreMap;
    }
);

const createArrayFromRawData = (array, mediaArray, genres) => {
    array.forEach((item) => {
        const itemGenres =
            item.genre_ids
                ?.map((genreId) => genres[genreId])
                .filter(Boolean) || [];

        if (
            item.poster_path &&
            !mediaArray.some((media) => media.id === item.id)
        ) {
            mediaArray.push({
                id: item.id,

                mediaType:
                    item.media_type || (item.first_air_date ? "tv" : "movie"),

                name:
                    item.title ||
                    item.original_title ||
                    item.name ||
                    item.original_name,

                image: item.poster_path,

                backdrop: item.backdrop_path,

                overview: item.overview,

                releaseDate:
                    item.release_date || item.first_air_date,

                rating: item.vote_average,

                votes: item.vote_count,

                popularity: item.popularity,

                language: item.original_language,

                adult: item.adult,

                genres: itemGenres,

                genreIds: item.genre_ids || [],

                originCountry: item.origin_country || [],

                originalName: item.original_name,

                originalTitle: item.original_title,
            });
        }
    });
};

const getRawData = async (
    api,
    genres,
    paging = true,
    maxItems = 120,
    maxPages = 20
) => {
    const mediaArray = [];

    for (
        let page = 1;
        mediaArray.length < maxItems && page <= maxPages;
        page++
    ) {
        try {
            const { data } = await axios.get(
                `${api}${paging ? `&page=${page}` : ""}`
            );

            createArrayFromRawData(
                data.results || [],
                mediaArray,
                genres
            );

            if (!data.results?.length) break;

        } catch (error) {
            console.error("TMDB Error:", error);
            break;
        }
    }

    return mediaArray;
};

export const fetchCategory = createAsyncThunk(
    "streamify/fetchCategory",
    async (
        {
            page,
            category,
            endpoint,
            paging = true,
            maxItems = 120,
            maxPages = 20,
        },
        thunkAPI
    ) => {
        const {
            streamify: { genres },
        } = thunkAPI.getState();

        const separator = endpoint.includes("?") ? "&" : "?";

        const data = await getRawData(
            `${TMDB_BASE_URL}${endpoint}${separator}api_key=${API_KEY}`,
            genres,
            paging,
            maxItems,
            maxPages
        );

        return { page, category, data };
    }
);


const StreamifySlice = createSlice({
    name: "Streamify",
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getGenres.fulfilled, (state, action) => {
            state.genres = action.payload;
            state.genresLoaded = true;
        });
        builder.addCase(fetchCategory.fulfilled, (state, action) => {
            const { page, category, data } = action.payload;

            if (!state[page]) {
                state[page] = {};
            }

            state[page][category] = data;
        });
    },
});

export const store = configureStore({
    reducer: {
        streamify: StreamifySlice.reducer,
    }
});