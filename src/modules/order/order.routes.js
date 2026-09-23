import express from "express";
import {
    createOrder,
    deleteOrder,
    getAllOrders,
    getMyOrders,
    getSingleOrder,
    trackOrderGuest,
    updateOrderStatus,
} from "./order.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { createOrderSchema, updateOrderStatusSchema } from "./order.validation.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.post(
    "/create-order",
    validateRequest(createOrderSchema),
    createOrder
);

router.get("/track", trackOrderGuest);

router.get("/my-orders", verifyToken, getMyOrders);

router.get("/", verifyToken, protectRoute(ROLES.ADMIN), getAllOrders);


router.get("/:id", verifyToken, getSingleOrder);


router.patch(
    "/:id/status",
    verifyToken,
    protectRoute(ROLES.ADMIN),
    validateRequest(updateOrderStatusSchema),
    updateOrderStatus
);

router.delete("/:id", verifyToken, protectRoute(ROLES.ADMIN), deleteOrder);

export default router;