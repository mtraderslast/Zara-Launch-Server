import express from "express";
import { createReview, deleteReview, editProductReview, getHomeTopReviews, getProductReviews } from "./review.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { ROLES } from "../../utils/roles.js";


const router = express.Router();

router.get('/home-page-review', getHomeTopReviews);
router.post("/create-review", verifyToken, protectRoute(ROLES.USER), createReview);
router.get("/:productId", getProductReviews);
router.patch("/:id", verifyToken, protectRoute(ROLES.USER), editProductReview);
router.delete("/:id", verifyToken, protectRoute(ROLES.USER), deleteReview);

export default router;