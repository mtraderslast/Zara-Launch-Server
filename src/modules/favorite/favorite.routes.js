import express from "express";
import {
    checkIsFavorite,
    getMyFavorites,
    removeFavorite,
    toggleFavorite,
} from "./favorite.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/toggle", verifyToken, toggleFavorite);
router.get("/my-favorites", verifyToken, getMyFavorites);
router.get("/check/:productId", verifyToken, checkIsFavorite);
router.delete("/:productId", verifyToken, removeFavorite);

export default router;