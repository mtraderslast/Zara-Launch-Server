import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { ROLES } from "../../utils/roles.js";
import { createProduct, deleteProduct, getProductDetails, updateProduct } from "./product.controller.js";


const router = express.Router();

router.get("/", );
router.post("/create-product", createProduct);
router.get("/:slug", getProductDetails);
router.patch("/:slug", verifyToken, protectRoute(ROLES.ADMIN), updateProduct);
router.delete("/:slug", verifyToken, protectRoute(ROLES.ADMIN), deleteProduct);


export default router;