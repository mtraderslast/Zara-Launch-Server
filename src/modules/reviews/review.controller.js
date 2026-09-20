import mongoose from "mongoose";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Product from "../product/product.model.js";
import Review from "./review.model.js";

export const createReview = catchAsync(async (req, res) => {
    const { productId, rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        throw new AppError(401, "You must be logged in to post a review");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError(404, "Product not found");
    }

    const user = await mongoose.connection.collection("user").findOne({
        _id: new mongoose.Types.ObjectId(userId),
    });

    if (!user) {
        throw new AppError(404, "User profile not found");
    }

    const existingReview = await Review.findOne({ productId, userId });

    if (existingReview) {
        throw new AppError(400, "You have already submitted a review for this product");
    }

    const newReview = await Review.create({
        productId,
        userId,
        userName: user.name || "Anonymous",
        userEmail: user.email,
        userImage: user.image || "",
        rating: Number(rating),
        comment,
    });

    res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: newReview,
    });
});