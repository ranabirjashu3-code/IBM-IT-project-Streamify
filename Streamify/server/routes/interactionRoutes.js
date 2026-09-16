import express from "express";
import Interaction from "../models/Interaction.js";

const router = express.Router();

router.get("/:contentId", async (req, res) => {
    try {
        const { contentId } = req.params;

        let interaction = await Interaction.findOne({
            contentId
        });

        if (!interaction) {
            interaction = await Interaction.create({
                contentId,
                likes: [],
                dislikes: []
            });
        }

        res.status(200).json({
            likes: interaction.likes.length,
            dislikes: interaction.dislikes.length,
            likedBy: interaction.likes,
            dislikedBy: interaction.dislikes
        });

    } catch (error) {
        console.error(
            "Error fetching interactions:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch interactions"
        });
    }
});

router.post("/:contentId/like", async (req, res) => {
    try {
        const { contentId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        let interaction = await Interaction.findOne({
            contentId
        });

        if (!interaction) {
            interaction = await Interaction.create({
                contentId,
                likes: [],
                dislikes: []
            });
        }

        const alreadyLiked =
            interaction.likes.includes(userId);

        if (alreadyLiked) {
            interaction.likes =
                interaction.likes.filter(
                    id => id !== userId
                );
        } else {
            interaction.likes.push(userId);

            interaction.dislikes =
                interaction.dislikes.filter(
                    id => id !== userId
                );
        }

        await interaction.save();

        res.status(200).json({
            likes: interaction.likes.length,
            dislikes: interaction.dislikes.length,
            liked: !alreadyLiked,
            disliked: false
        });

    } catch (error) {
        console.error(
            "Error liking content:",
            error
        );

        res.status(500).json({
            message: "Failed to like content"
        });
    }
});

router.post("/:contentId/dislike", async (req, res) => {
    try {
        const { contentId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        let interaction = await Interaction.findOne({
            contentId
        });

        if (!interaction) {
            interaction = await Interaction.create({
                contentId,
                likes: [],
                dislikes: []
            });
        }

        const alreadyDisliked =
            interaction.dislikes.includes(userId);

        if (alreadyDisliked) {
            interaction.dislikes =
                interaction.dislikes.filter(
                    id => id !== userId
                );
        } else {
            interaction.dislikes.push(userId);

            interaction.likes =
                interaction.likes.filter(
                    id => id !== userId
                );
        }

        await interaction.save();

        res.status(200).json({
            likes: interaction.likes.length,
            dislikes: interaction.dislikes.length,
            liked: false,
            disliked: !alreadyDisliked
        });

    } catch (error) {
        console.error(
            "Error disliking content:",
            error
        );

        res.status(500).json({
            message: "Failed to dislike content"
        });
    }
});

export default router;