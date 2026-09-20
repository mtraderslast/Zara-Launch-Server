import { z } from "zod";

const variantSchema = z.object({
    attributes: z.record(z.string(), z.string()),

    price: z
        .number()
        .min(0, "Price cannot be negative")
        .optional(),

    stock: z
        .number()
        .int("Stock must be a whole number")
        .min(0, "Stock cannot be negative"),

    sku: z
        .string()
        .trim()
        .optional(),
});

export const createProductSchema = z.object({
    titleBn: z
        .string()
        .trim()
        .min(1, "Bangla title is required"),

    titleEn: z
        .string()
        .trim()
        .min(1, "English title is required"),

    slug: z
        .string()
        .trim()
        .min(1, "Slug is required"),

    descriptionBn: z
        .string()
        .trim()
        .min(1, "Bangla description is required"),

    category: z
        .string()
        .trim()
        .min(1, "Category is required"),

    subCategory: z
        .string()
        .trim()
        .optional(),

    brand: z
        .string()
        .trim()
        .optional(),

    price: z
        .number()
        .min(0, "Price cannot be negative"),

    discountRate: z
        .number()
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot exceed 100")
        .default(0),

    images: z
        .array(z.string().url("Invalid image URL"))
        .min(1, "At least one image is required"),

    isFeatured: z
        .boolean()
        .default(false),

    status: z
        .enum(["active", "draft"])
        .default("active"),

    tags: z
        .array(z.string().trim())
        .default([]),

    hasVariants: z
        .boolean()
        .default(false),

    variants: z
        .array(variantSchema)
        .default([]),
});