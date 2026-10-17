import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import { CATEGORY_VALUES, isValidSubCategory } from "../../utils/categories.js";
import Product from "./product.model.js";
import { createProductSchema, updateProductSchema } from "./product.validation.js";

export const createProduct = catchAsync(async (req, res) => {
    const validatedData = await createProductSchema.parseAsync(req.body);

    const existingProduct = await Product.findOne({ slug: validatedData.slug });
    if (existingProduct) {
        throw new AppError(400, "A product with this slug already exists");
    }

    const newProduct = await Product.create(validatedData);

    res.status(201).json({
        success: true,
        message: "New Product Created Successfully",
        data: newProduct,
    });
});

export const getAllProducts = catchAsync(async (req, res) => {
    const {
        category,
        subCategory,
        brand,
        isFeatured,
        status,
        search,
        minPrice,
        maxPrice,
        sortBy = "newest",
        page = 1,
        limit = 12,
    } = req.query;

    const query = {};

    if (status && status !== "ALL") {
        query.status = status;
    } else if (!status) {
        query.status = "active";
    }

    if (category && category !== "ALL") query.category = category;
    if (subCategory && subCategory !== "ALL") query.subCategory = subCategory;
    if (brand) query.brand = brand;
    if (isFeatured !== undefined) query.isFeatured = isFeatured === "true";

    if (search && search.trim() !== "") {
        query.$or = [
            { titleEn: { $regex: search.trim(), $options: "i" } },
            { titleBn: { $regex: search.trim(), $options: "i" } },
            { tags: { $regex: search.trim(), $options: "i" } },
        ];
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === "price_low_high") {
        sortOptions = { price: 1 };
    } else if (sortBy === "price_high_low") {
        sortOptions = { price: -1 };
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNumber - 1) * limitNumber;

    const [products, total] = await Promise.all([
        Product.find(query).sort(sortOptions).skip(skip).limit(limitNumber),
        Product.countDocuments(query),
    ]);

    res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: Math.max(1, Math.ceil(total / limitNumber)),
        },
        data: products,
    });
});

// হোম পেজের ক্যাটাগরি সেকশনের জন্য: প্রতিটি ক্যাটাগরিতে কতটি অ্যাক্টিভ পণ্য আছে ও সর্বশেষ পণ্যের একটি ছবি
export const getCategorySummary = catchAsync(async (req, res) => {
    const summary = await Product.aggregate([
        { $match: { status: "active", category: { $in: CATEGORY_VALUES } } },
        { $sort: { isFeatured: -1, createdAt: -1 } },
        {
            $group: {
                _id: "$category",
                productCount: { $sum: 1 },
                image: { $first: { $arrayElemAt: ["$images", 0] } },
            },
        },
        { $project: { _id: 0, category: "$_id", productCount: 1, image: 1 } },
    ]);

    const byCategory = new Map(summary.map((item) => [item.category, item]));
    const data = CATEGORY_VALUES.filter((category) => byCategory.has(category)).map((category) =>
        byCategory.get(category)
    );

    res.status(200).json({
        success: true,
        message: "Category summary fetched successfully",
        data,
    });
});

export const getProductDetails = catchAsync(async (req, res) => {
    const { slug } = req.params;

    const product = await Product.findOne({ slug });
    if (!product) {
        throw new AppError(404, "Product not found");
    }

    res.status(200).json({
        success: true,
        message: "Product details retrieved successfully",
        data: product,
    });
});

export const getProductById = catchAsync(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
        throw new AppError(404, "Product not found");
    }

    res.status(200).json({
        success: true,
        message: "Product retrieved successfully",
        data: product,
    });
});

export const updateProduct = catchAsync(async (req, res) => {
    const { id } = req.params;

    const validatedData = await updateProductSchema.parseAsync(req.body);

    const product = await Product.findById(id);
    if (!product) {
        throw new AppError(404, "Product not found");
    }

    if (validatedData.slug && validatedData.slug !== product.slug) {
        const slugTaken = await Product.exists({ slug: validatedData.slug, _id: { $ne: id } });
        if (slugTaken) {
            throw new AppError(400, "A product with this slug already exists");
        }
    }

    // undefined মান বাদ দিয়ে শুধু পাঠানো ফিল্ডগুলো সেট করা হচ্ছে
    const updates = Object.fromEntries(
        Object.entries(validatedData).filter(([, value]) => value !== undefined)
    );

    const nextCategory = updates.category ?? product.category;
    const nextSubCategory = updates.subCategory ?? product.subCategory;
    if (!isValidSubCategory(nextCategory, nextSubCategory)) {
        throw new AppError(400, "Sub-category does not belong to the selected category");
    }

    // save() ব্যবহার করা হয়েছে যাতে মডেলের ভ্যালিডেটর (যেমন discountPrice < price) সঠিকভাবে চলে
    product.set(updates);
    const updatedProduct = await product.save();

    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
    });
});

export const deleteProduct = catchAsync(async (req, res) => {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
        throw new AppError(404, "Product not found");
    }

    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        data: null,
    });
});