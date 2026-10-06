import express from "express";
import { createOrder, deleteOrder, getAllOrders, getSingleOrder, trackOrderGuest, updateOrderStatus, } from "./order.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.get("/track", trackOrderGuest);

// Admin Routes
router.get("/", verifyToken, protectRoute(ROLES.ADMIN), getAllOrders);
router.get("/:id", verifyToken, protectRoute(ROLES.ADMIN), getSingleOrder);
router.patch("/:id/status", verifyToken, protectRoute(ROLES.ADMIN), updateOrderStatus);
router.delete("/:id", verifyToken, protectRoute(ROLES.ADMIN), deleteOrder);

export default router;