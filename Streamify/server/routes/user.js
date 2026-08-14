import express from "express";
import User from "../models/user.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      firebaseUid,
      name,
      email,
      profileImage,
      bio,
    } = req.body;

    console.log("Received user:", {
      firebaseUid,
      name,
      email,
    });

    // Check Firebase UID
    let existingUser = await User.findOne({ firebaseUid });

    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    // Check email
    existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    // Create new user
    const user = await User.create({
      firebaseUid,
      name,
      email,
      profileImage,
      bio,
    });

    return res.status(201).json(user);

  } catch (error) {
    console.error("USER CREATION ERROR:", error);

    return res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
});

export default router;