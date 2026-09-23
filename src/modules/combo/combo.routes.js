import express from "express";
import {
    createCombo,
    deleteCombo,
    getActiveCombos,
    getAllCombosForAdmin,
    getComboBySlug,
    updateCombo,
} from "./combo.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import protectRoute from "../../middleware/protectRoute.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { createComboSchema, updateComboSchema } from "./combo.validation.js";
import { ROLES } from "../../utils/roles.js";

const router = express.Router();


router.get("/active", getActiveCombos);
router.get("/landing/:slug", getComboBySlug);


router.get(
    "/admin/all",
    verifyToken,
    protectRoute(ROLES.ADMIN),
    getAllCombosForAdmin
);

router.post(
    "/",
    verifyToken,
    protectRoute(ROLES.ADMIN),
    validateRequest(createComboSchema),
    createCombo
);

router.patch(
    "/:id",
    verifyToken,
    protectRoute(ROLES.ADMIN),
    validateRequest(updateComboSchema),
    updateCombo
);

router.delete(
    "/:id",
    verifyToken,
    protectRoute(ROLES.ADMIN),
    deleteCombo
);

export default router;