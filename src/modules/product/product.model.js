import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        // Basic Information
        titleBn: {
            type: String,
            required: true,
            trim: true,
        },

        titleEn: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        descriptionBn: {
            type: String,
            required: true,
            trim: true,
        },

        // Category
        category: {
            type: String,
            required: true,
            trim: true,
        },

        subCategory: {
            type: String,
            trim: true,
        },

        brand: {
            type: String,
            trim: true,
        },

        // Pricing
        price: {
            type: Number,
            required: true,
            min: 0,
        },

        discountRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        // Images
        images: [
            {
                type: String,
                required: true,
            },
        ],

        // Product Management
        isFeatured: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["active", "draft"],
            default: "active",
        },

        tags: [
            {
                type: String,
                trim: true,
            },
        ],

        // Variants
        hasVariants: {
            type: Boolean,
            default: false,
        },

        variants: [
            {
                attributes: {
                    type: Map,
                    of: String,
                },

                price: {
                    type: Number,
                    min: 0,
                },

                stock: {
                    type: Number,
                    default: 0,
                    min: 0,
                },

                sku: {
                    type: String,
                    trim: true,
                },
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;