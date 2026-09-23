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

    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
        throw new AppError(400, "You have already submitted a review for this product");
    }

    // req.user-এ ডাটা না থাকলে কালেকশন থেকে ফেচ (Better Auth兼容)
    let userName = req.user?.name;
    let userEmail = req.user?.email;
    let userImage = req.user?.image || "";

    if (!userName || !userEmail) {
        const queryId = mongoose.Types.ObjectId.isValid(userId)
            ? new mongoose.Types.ObjectId(userId)
            : userId;

        const user = await mongoose.connection.collection("user").findOne({ _id: queryId });

        if (!user) {
            throw new AppError(404, "User profile not found");
        }

        userName = user.name || "Anonymous";
        userEmail = user.email;
        userImage = user.image || "";
    }

    const newReview = await Review.create({
        productId,
        userId,
        userName,
        userEmail,
        userImage,
        rating: Number(rating),
        comment,
    });

    res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: newReview,
    });
});

export const getProductReviews = catchAsync(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError(404, "Product not found");
    }

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: "Product reviews fetched successfully",
        data: reviews,
    });
});

export const editProductReview = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    const review = await Review.findById(id);
    if (!review) {
        throw new AppError(404, "Review not found");
    }

    if (review.userId !== userId) {
        throw new AppError(403, "You are not authorized to edit this review");
    }

    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;

    const updatedReview = await review.save();

    res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: updatedReview,
    });
});

export const deleteReview = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const review = await Review.findById(id);
    if (!review) {
        throw new AppError(404, "Review not found");
    }

    const isOwner = review.userId === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
        throw new AppError(403, "You are not authorized to delete this review");
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
        data: null,
    });
});

export const getHomeTopReviews = catchAsync(async (req, res) => {
    const reviews = await Review.find()
        .sort({ rating: -1, createdAt: -1 })
        .limit(8);

    res.status(200).json({
        success: true,
        message: "Home top reviews fetched successfully",
        data: reviews,
    });
});