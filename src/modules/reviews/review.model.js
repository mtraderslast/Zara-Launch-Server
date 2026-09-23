import mongoose, { Schema } from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product id is required"],
        },
        userId: {
            type: String,
            required: [true, "User id is required"],
        },
        userName: {
            type: String,
            required: [true, "User name is required"],
        },
        userEmail: {
            type: String,
            required: [true, "User email is required"], 
        },
        userImage: {
            type: String,
            default: "",
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot be more than 5"],
        },
        comment: {
            type: String,
            required: [true, "Comment is required"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;