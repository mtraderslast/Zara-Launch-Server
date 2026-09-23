import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
    {
        attributes: {
            type: Map,
            of: String,
            default: {},
        },
        price: {
            type: Number,
            min: [0, "Variant price cannot be negative"],
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, "Stock cannot be negative"],
        },
        sku: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        titleBn: {
            type: String,
            required: [true, "Bangla title is required"],
            trim: true,
        },
        titleEn: {
            type: String,
            required: [true, "English title is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        descriptionBn: {
            type: String,
            required: [true, "Bangla description is required"],
            trim: true,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
            index: true,
        },
        subCategory: {
            type: String,
            trim: true,
            index: true,
        },
        brand: {
            type: String,
            trim: true,
            index: true,
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        discountRate: {
            type: Number,
            default: 0,
            min: [0, "Discount cannot be negative"],
            max: [100, "Discount cannot exceed 100"],
        },
        images: {
            type: [String],
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0,
                message: "At least one product image is required",
            },
        },
        isFeatured: {
            type: Boolean,
            default: false,
            index: true,
        },
        status: {
            type: String,
            enum: ["active", "draft"],
            default: "active",
            index: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        hasVariants: {
            type: Boolean,
            default: false,
        },
        variants: {
            type: [variantSchema],
            default: [],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

productSchema.index({ titleEn: "text", titleBn: "text", tags: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;