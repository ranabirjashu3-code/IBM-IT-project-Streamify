import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.js";
import watchlistRoutes from "./routes/watchlist.js";
import dns from "dns";

dotenv.config();

const app = express();
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Streamify API is running",
  });
});

// ===============================
// CORS
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://streamify-pied.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ===============================
// Middleware
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Test route
// ===============================
app.get("/", (req, res) => {
  res.json({
    message: "Streamify API is running",
  });
});

// ===============================
// Routes
// ===============================
app.use("/api/users", userRoutes);
app.use("/api/watchlist", watchlistRoutes);

// ===============================
// DNS
// ===============================
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ===============================
// MongoDB
// ===============================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });

// ===============================
// Server
// ===============================
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});