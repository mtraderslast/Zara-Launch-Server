import { z } from "zod";

export const createComboValidationSchema = z.object({
    title: z.string({
        required_error: "Combo title is required",
    }),
    slug: z.string({
        required_error: "Slug is required",
    }),
    description: z.string({
        required_error: "Description is required",
    }),
    bannerImage: z.string({
        required_error: "Banner image URL is required",
    }),
    videoUrl: z.string().optional().default(""),
    products: z
        .array(
            z.object({
                productId: z.string({
                    required_error: "Product ID is required",
                }),
                quantity: z.number().min(1).default(1),
            })
        )
        .min(1, "At least one product must be included in the combo"),
    originalPrice: z.number({
        required_error: "Original price is required",
    }),
    comboPrice: z.number({
        required_error: "Combo price is required",
    }),
    stock: z.number({
        required_error: "Stock is required",
    }),
    isActive: z.boolean().optional().default(true),
});

export const updateComboValidationSchema = z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    bannerImage: z.string().optional(),
    videoUrl: z.string().optional(),
    products: z
        .array(
            z.object({
                productId: z.string(),
                quantity: z.number().min(1),
            })
        )
        .optional(),
    originalPrice: z.number().optional(),
    comboPrice: z.number().optional(),
    stock: z.number().optional(),
    isActive: z.boolean().optional(),
});