import express from "express";
import User from "../models/user.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { firebaseUid, name, email, profileImage, bio } = req.body;

    const existingUser = await User.findOne({ firebaseUid });

    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    const user = await User.create({
      firebaseUid,
      name,
      email,
      profileImage,
      bio,
    });

    res.status(201).json(user);

  } catch (error) {
    console.error("User creation error:", error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
});

export default router;