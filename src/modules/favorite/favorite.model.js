import mongoose, { Schema } from "mongoose";

const favoriteSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);
export default Favorite;