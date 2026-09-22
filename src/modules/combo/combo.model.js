import mongoose, { Schema } from "mongoose";

const comboSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Combo title is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Combo slug is required"],
            unique: true,
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        bannerImage: {
            type: String,
            required: [true, "Banner image URL is required"],
        },
        videoUrl: {
            type: String,
            default: "",
        },
        products: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: [true, "Product ID is required"],
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: [1, "Quantity must be at least 1"],
                },
            },
        ],
        originalPrice: {
            type: Number,
            required: [true, "Original total price is required"],
        },
        comboPrice: {
            type: Number,
            required: [true, "Combo price is required"],
        },
        stock: {
            type: Number,
            required: [true, "Stock quantity is required"],
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Combo = mongoose.model("Combo", comboSchema);
export default Combo;