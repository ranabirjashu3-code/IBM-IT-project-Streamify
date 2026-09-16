import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        contentId: {
            type: String,
            required: true
        },

        userId: {
            type: String,
            required: true
        },

        username: {
            type: String,
            required: true
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        }
    },
    {
        timestamps: true
    }
);

const Comment = mongoose.model(
    "Comment",
    commentSchema
);

export default Comment;