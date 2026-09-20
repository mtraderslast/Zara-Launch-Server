import { z } from 'zod';

export const reviewValidationSchema = z.object({
    productId: z.string({
        required_error: "Product ID is required",
    }),
    rating: z
        .number({
            required_error: "Rating is required",
        })
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot be more than 5"),
    comment: z.string({
        required_error: "Comment is required",
    }),
});