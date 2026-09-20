import { json } from "zod";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Product from "./product.model.js";
import { createProductSchema, updateProductSchema } from "./product.validation.js";

export const createProduct = catchAsync(async (req, res) => {
    const body = req.body;

    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
        throw new AppError(400, `Validation failed: ${parsed.error.issues[0].message || 'Invalid input'}`);
    }

    const newProduct = await Product.create(parsed.data);

    return res.status(201).json({
        success: true,
        message: "New Product Created Successfully",
        data: newProduct,
    });
});

export const getProductDetails = catchAsync(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        throw new AppError(404, "Product not found");
    }

    return res.status(200).json({
        success: true,
        message: "Product details retrieved successfully",
        data: product,
    })
});

export const updateProduct = catchAsync(async (req, res) => {
    const { id } = req.params;

    const parsed = updateProductSchema.safeParse(req.body);

    if (!parsed.success) {
        throw new AppError(400, parsed.error.issues[0]?.message || "Invalid product data");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        parsed.data,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updateProduct) {
        throw new AppError(404, "Product not found");
    }

    return res.status(200).json({
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

    return res.status(200, json({
        success: true,
        message: "Product deleted successfully",
        data: null,
    }));
});