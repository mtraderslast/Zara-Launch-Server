import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductDetails, updateProduct } from "./product.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { createProductSchema, updateProductSchema } from "./product.validation.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductDetails);

router.post(
    "/",
    verifyToken,
    protectRoute(ROLES.ADMIN),
    validateRequest(createProductSchema),
    createProduct
);

router.patch(
    "/:id",
    verifyToken,
    protectRoute(ROLES.ADMIN),
    validateRequest(updateProductSchema),
    updateProduct
);

router.delete(
    "/:id",
    verifyToken,
    protectRoute(ROLES.ADMIN),
    deleteProduct
);

export default router;