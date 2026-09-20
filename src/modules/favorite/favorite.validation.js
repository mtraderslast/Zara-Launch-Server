import { z } from "zod";

export const createFavoriteValidationSchema = z.object({
    productId: z.string({
        required_error: "Product ID is required",
    }),
});