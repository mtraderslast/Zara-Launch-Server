import express from "express";
import {
    checkIsFavorite,
    getMyFavorites,
    removeFavorite,
    toggleFavorite,
} from "./favorite.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { favoriteValidationSchema } from "./favorite.validation.js";

const router = express.Router();


router.post(
    "/toggle",
    verifyToken,
    validateRequest(favoriteValidationSchema),
    toggleFavorite
);

router.get("/my-favorites", getMyFavorites);

router.get("/check/:productId", checkIsFavorite);

router.delete("/:productId", removeFavorite);

export default router;