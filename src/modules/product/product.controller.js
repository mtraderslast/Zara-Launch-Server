import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Product from "../products/product.model.js";
import { createProductSchema } from "./product.validation.js";

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

