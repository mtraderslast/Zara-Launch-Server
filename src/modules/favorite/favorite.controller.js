import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Product from "../product/product.model.js";
import Favorite from "./favorite.model.js";


export const toggleFavorite = catchAsync(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user?.id;

    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError(404, "Product not found");
    }

    const existingFavorite = await Favorite.findOne({ userId, productId });

    if (existingFavorite) {
        await Favorite.findByIdAndDelete(existingFavorite._id);
        return res.status(200).json({
            success: true,
            message: "Product removed from favorites",
            isFavorite: false,
            data: null,
        });
    }

    const newFavorite = await Favorite.create({
        userId,
        productId,
    });

    res.status(201).json({
        success: true,
        message: "Product added to favorites",
        isFavorite: true,
        data: newFavorite,
    });
});

export const getMyFavorites = catchAsync(async (req, res) => {
    const userId = req.user?.id;

    const rawFavorites = await Favorite.find({ userId })
        .populate("productId", "titleEn titleBn price discountRate images status slug")
        .sort({ createdAt: -1 });

    const activeFavorites = rawFavorites.filter((fav) => fav.productId !== null);

    res.status(200).json({
        success: true,
        message: "Favorite products fetched successfully",
        count: activeFavorites.length,
        data: activeFavorites,
    });
});

export const removeFavorite = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user?.id;

    const favorite = await Favorite.findOneAndDelete({ userId, productId });

    if (!favorite) {
        throw new AppError(404, "Favorite item not found");
    }

    res.status(200).json({
        success: true,
        message: "Product removed from favorites",
        data: null,
    });
});


export const checkIsFavorite = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user?.id;

    const favorite = await Favorite.findOne({ userId, productId });

    res.status(200).json({
        success: true,
        message: "Favorite status checked successfully",
        data: {
            isFavorite: Boolean(favorite),
        },
    });
});