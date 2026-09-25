import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Product from "./product.model.js";
import { createProductSchema } from "./product.validation.js";

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
    const { category, brand, isFeatured, search, page = 1, limit = 10 } = req.query;

    const query = { status: "active" };

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (isFeatured !== undefined) query.isFeatured = isFeatured === "true";
    if (search) {
        query.$or = [
            { titleEn: { $regex: search, $options: "i" } },
            { titleBn: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
        Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        Product.countDocuments(query),
    ]);

    res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
        data: products,
    });
});

export const getProductDetails = catchAsync(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
        throw new AppError(404, "Product not found");
    }

    res.status(200).json({
        success: true,
        message: "Product details retrieved successfully",
        data: product,
    });
});

export const updateProduct = catchAsync(async (req, res) => {
    const { id } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedProduct) {
        throw new AppError(404, "Product not found");
    }

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