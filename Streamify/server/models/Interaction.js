import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
    {
        contentId: {
            type: String,
            required: true,
            unique: true
        },

        likes: [
            {
                type: String
            }
        ],

        dislikes: [
            {
                type: String
            }
        ]
    },
    {
        timestamps: true
    }
);

const Interaction = mongoose.model(
    "Interaction",
    interactionSchema
);

export default Interaction;