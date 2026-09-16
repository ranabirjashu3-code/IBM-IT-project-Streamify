import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/users.js";
import watchlistRoutes from "./routes/watchlist.js";
import watchHistoryRouter from "./routes/watchHistory.js";
import tmdbRoutes from "./routes/tmdbRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import interactionRoutes from "./routes/interactionRoutes.js";
import dns from "dns";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/watch-history", watchHistoryRouter);
app.use("/api/tmdb", tmdbRoutes);
app.use("/api/comments",commentRoutes);
app.use("/api/interactions",interactionRoutes);


mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
    });


app.listen(8080, () => {
    console.log("Streamify server is running...");
});