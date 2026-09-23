import { z } from "zod";

const comboItemValidationSchema = z.object({
    productId: z.string().optional().nullable(),
    title: z.string().trim().min(1, "Item title is required"),
    image: z.string().optional().default(""),
    quantity: z
        .number()
        .int("Quantity must be a whole number")
        .min(1, "Quantity must be at least 1")
        .default(1),
});

export const createComboSchema = z.object({
    body: z.object({
        title: z.string().trim().min(1, "Combo title is required"),
        slug: z.string().trim().min(1, "Slug is required"),
        description: z.string().trim().min(1, "Description is required"),
        bannerImage: z.string().url("Valid banner image URL is required"),
        images: z.array(z.string().url("Invalid image URL")).optional().default([]),
        videoUrl: z.string().optional().default(""),
        features: z.array(z.string().trim()).optional().default([]),
        products: z
            .array(comboItemValidationSchema)
            .min(1, "At least one product item must be included in the combo"),
        originalPrice: z.number().min(0, "Original price cannot be negative"),
        comboPrice: z.number().min(0, "Combo price cannot be negative"),
        stock: z
            .number()
            .int("Stock must be an integer")
            .min(0, "Stock cannot be negative")
            .default(0),
        isActive: z.boolean().optional().default(true),
    }),
});

export const updateComboSchema = z.object({
    body: createComboSchema.shape.body.partial(),
});