import express from "express";
import Comment from "../models/Comment.js";

const router = express.Router();


// GET ALL COMMENTS
router.get("/:contentId", async (req, res) => {
    try {
        const { contentId } = req.params;

        const comments = await Comment.find({
            contentId
        }).sort({
            createdAt: -1
        });

        res.status(200).json(comments);

    } catch (error) {
        console.error("Fetch comments error:", error);

        res.status(500).json({
            message: "Failed to fetch comments"
        });
    }
});


// CREATE COMMENT
router.post("/:contentId", async (req, res) => {
    try {
        const { contentId } = req.params;

        const {
            userId,
            username,
            text
        } = req.body;

        if (!userId || !username || !text) {
            return res.status(400).json({
                message:
                    "User ID, username and text are required"
            });
        }

        const comment = await Comment.create({
            contentId,
            userId,
            username,
            text
        });

        res.status(201).json(comment);

    } catch (error) {
        console.error("Create comment error:", error);

        res.status(500).json({
            message: "Failed to create comment"
        });
    }
});

//Edit comment
router.put("/:commentId", async (req, res) => {
    try {
        const { commentId } = req.params;
        const { userId, text } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        const comment = await Comment.findById(
            commentId
        );

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        if (comment.userId !== userId) {
            return res.status(403).json({
                message:
                    "You can edit only your own comment"
            });
        }

        comment.text = text.trim();

        await comment.save();

        res.status(200).json(comment);

    } catch (error) {
        console.error(
            "Edit comment error:",
            error
        );

        res.status(500).json({
            message: "Failed to edit comment"
        });
    }
});


// DELETE COMMENT
router.delete("/:commentId", async (req, res) => {
    try {
        const { commentId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        const comment = await Comment.findById(
            commentId
        );

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        if (comment.userId !== userId) {
            return res.status(403).json({
                message:
                    "You can delete only your own comment"
            });
        }

        await Comment.findByIdAndDelete(
            commentId
        );

        res.status(200).json({
            message:
                "Comment deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete comment error:",
            error
        );

        res.status(500).json({
            message: "Failed to delete comment"
        });
    }
});


export default router;