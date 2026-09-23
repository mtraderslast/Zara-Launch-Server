import mongoose, { Schema } from "mongoose";

const comboItemSchema = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            default: null,
        },
        title: {
            type: String,
            required: [true, "Combo item title is required"],
            trim: true,
        },
        image: {
            type: String,
            default: "",
        },
        quantity: {
            type: Number,
            required: [true, "Item quantity is required"],
            min: [1, "Quantity must be at least 1"],
            default: 1,
        },
    },
    { _id: false }
);

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
            index: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        bannerImage: {
            type: String,
            required: [true, "Banner image URL is required"],
        },
        images: {
            type: [String],
            default: [],
        },
        videoUrl: {
            type: String,
            default: "",
        },
        features: {
            type: [String],
            default: [],
        },
        products: {
            type: [comboItemSchema],
            required: [true, "Products are required for combo"],
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0,
                message: "At least one product item is required in the combo",
            },
        },
        originalPrice: {
            type: Number,
            required: [true, "Original total price is required"],
            min: 0,
        },
        comboPrice: {
            type: Number,
            required: [true, "Combo special price is required"],
            min: 0,
        },
        stock: {
            type: Number,
            required: [true, "Stock quantity is required"],
            min: 0,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Combo = mongoose.model("Combo", comboSchema);
export default Combo;