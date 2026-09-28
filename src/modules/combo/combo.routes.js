import express from "express";
import { createCombo, deleteCombo, getActiveCombos, getAllCombos, getComboBySlug, updateCombo, } from "./combo.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();

router.get("/", getActiveCombos);
router.get("/:slug", getComboBySlug);
router.get("/admin/all", verifyToken, protectRoute(ROLES.ADMIN), getAllCombos);
router.post("/", verifyToken, protectRoute(ROLES.ADMIN), createCombo);
router.patch("/:id", verifyToken, protectRoute(ROLES.ADMIN), updateCombo);
router.delete("/:id", verifyToken, protectRoute(ROLES.ADMIN), deleteCombo);

export default router;