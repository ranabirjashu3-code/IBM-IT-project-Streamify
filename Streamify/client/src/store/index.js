import {
    configureStore,
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";
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
        const API_URL = import.meta.env.VITE_API_URL;

        const [movieRes, tvRes] = await Promise.all([
            axios.get(`${API_URL}/api/tmdb/genres/movie`),
            axios.get(`${API_URL}/api/tmdb/genres/tv`),
        ]);

        const genreMap = {};

        [
            ...movieRes.data.genres,
            ...tvRes.data.genres,
        ].forEach((genre) => {
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
    endpoint,
    genres,
    paging = true,
    maxItems = 120,
    maxPages = 20
) => {
    const mediaArray = [];

    const API_URL = import.meta.env.VITE_API_URL;

    for (
        let page = 1;
        mediaArray.length < maxItems && page <= maxPages;
        page++
    ) {
        try {
            const { data } = await axios.get(
                `${API_URL}/api/tmdb/category`,
                {
                    params: {
                        endpoint,
                        page: paging ? page : undefined,
                    },
                }
            );

            createArrayFromRawData(
                data.results || [],
                mediaArray,
                genres
            );

            if (!data.results?.length) {
                break;
            }

        } catch (error) {
            console.error(
                "TMDB Error:",
                error.response?.data || error.message
            );

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

        const data = await getRawData(
            endpoint,
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


