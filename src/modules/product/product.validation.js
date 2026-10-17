import { z } from "zod";
import { CATEGORY_VALUES, isValidSubCategory } from "../../utils/categories.js";

// খালি/০/null ডিসকাউন্ট মানে "ডিসকাউন্ট নেই" => null
const optionalDiscountPrice = z
    .number()
    .min(0, "Discount price cannot be negative")
    .nullable()
    .optional()
    .transform((val) => (val ? val : null));

const variantSchema = z.object({
    attributes: z.record(z.string(), z.string()).default({}),
    price: z.number().min(0, "Price cannot be negative").optional(),
    discountPrice: optionalDiscountPrice,
    stock: z
        .number()
        .int("Stock must be an integer")
        .min(0, "Stock cannot be negative")
        .default(0),
    sku: z.string().trim().optional(),
});

/**
 * ভ্যারিয়েন্টের কোনো অ্যাট্রিবিউট ভ্যালুতে কমা (বা বাংলা কমা / '|') থাকলে সেটিকে ভেঙে
 * আলাদা আলাদা ভ্যারিয়েন্ট বানায়।
 *   { Size: "42, 46, 52" }  =>  { Size: "42" }, { Size: "46" }, { Size: "52" }
 * একাধিক অ্যাট্রিবিউটে এমন থাকলে সবগুলোর কম্বিনেশন (cartesian product) তৈরি হয়।
 * দাম, স্টক ইত্যাদি প্রতিটি নতুন ভ্যারিয়েন্টে কপি হয়; SKU থাকলে শেষে ভ্যালু যোগ হয়।
 */
const SPLIT_REGEX = /[,،|]/;

export const expandVariants = (variants = []) => {
    const result = [];

    for (const variant of variants) {
        const entries = Object.entries(variant.attributes || {}).map(([key, rawValue]) => {
            const values = String(rawValue)
                .split(SPLIT_REGEX)
                .map((v) => v.trim())
                .filter(Boolean);
            return [key.trim(), [...new Set(values)]];
        }).filter(([key, values]) => key && values.length > 0);

        if (entries.length === 0) {
            result.push({ ...variant, attributes: {} });
            continue;
        }

        let combos = [{}];
        for (const [key, values] of entries) {
            combos = combos.flatMap((combo) => values.map((value) => ({ ...combo, [key]: value })));
        }

        const needsSuffix = combos.length > 1;

        for (const attributes of combos) {
            const expanded = { ...variant, attributes };
            if (needsSuffix && variant.sku) {
                expanded.sku = `${variant.sku}-${Object.values(attributes).join("-")}`;
            }
            result.push(expanded);
        }
    }

    // একই অ্যাট্রিবিউট কম্বিনেশন ডুপ্লিকেট থাকলে প্রথমটি রাখা হবে
    const seen = new Set();
    return result.filter((v) => {
        const sorted = Object.entries(v.attributes).sort(([a], [b]) => a.localeCompare(b));
        const signature = JSON.stringify(sorted);
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
    });
};

const productBaseSchema = z.object({
    titleBn: z.string().trim().min(1, "Bangla title is required"),
    titleEn: z.string().trim().min(1, "English title is required"),
    slug: z.string().trim().toLowerCase().min(1, "Slug is required"),
    descriptionBn: z.string().trim().min(1, "Bangla description is required"),
    category: z.enum(CATEGORY_VALUES, { error: "Invalid category" }),
    subCategory: z.string().trim().optional(),
    brand: z.string().trim().optional(),
    price: z.number().min(0, "Price cannot be negative"),
    discountPrice: optionalDiscountPrice,
    images: z
        .array(z.string().url("Invalid image URL"))
        .min(1, "At least one image is required"),
    isFeatured: z.boolean().default(false),
    status: z.enum(["active", "draft"]).default("active"),
    tags: z.array(z.string().trim()).default([]),
    hasVariants: z.boolean().default(false),
    variants: z
        .array(variantSchema)
        .default([])
        .transform((variants) => expandVariants(variants)),
});

// ডিসকাউন্ট দাম (প্রোডাক্ট ও ভ্যারিয়েন্ট) অবশ্যই মূল দামের চেয়ে কম হতে হবে
const checkDiscounts = (data, ctx) => {
    if (data.discountPrice && data.price !== undefined && data.discountPrice >= data.price) {
        ctx.addIssue({
            code: "custom",
            path: ["discountPrice"],
            message: "Discount price must be less than the original price",
        });
    }

    (data.variants || []).forEach((variant, index) => {
        const base = variant.price > 0 ? variant.price : data.price;
        if (variant.discountPrice && base !== undefined && variant.discountPrice >= base) {
            ctx.addIssue({
                code: "custom",
                path: ["variants", index, "discountPrice"],
                message: "Variant discount price must be less than its original price",
            });
        }
    });

    if (data.hasVariants && Array.isArray(data.variants) && data.variants.length === 0) {
        ctx.addIssue({
            code: "custom",
            path: ["variants"],
            message: "At least one variant is required when variants are enabled",
        });
    }
};

export const createProductSchema = productBaseSchema.superRefine((data, ctx) => {
    checkDiscounts(data, ctx);
    if (!isValidSubCategory(data.category, data.subCategory)) {
        ctx.addIssue({
            code: "custom",
            path: ["subCategory"],
            message: "Sub-category does not belong to the selected category",
        });
    }
});

// আপডেটে সব ফিল্ড ঐচ্ছিক (default গুলো partial এ বাদ দেওয়া হয় যাতে না পাঠানো ফিল্ড ওভাররাইট না হয়)
export const updateProductSchema = z
    .object({
        titleBn: productBaseSchema.shape.titleBn.optional(),
        titleEn: productBaseSchema.shape.titleEn.optional(),
        slug: productBaseSchema.shape.slug.optional(),
        descriptionBn: productBaseSchema.shape.descriptionBn.optional(),
        category: productBaseSchema.shape.category.optional(),
        subCategory: productBaseSchema.shape.subCategory,
        brand: productBaseSchema.shape.brand,
        price: productBaseSchema.shape.price.optional(),
        discountPrice: z
            .number()
            .min(0, "Discount price cannot be negative")
            .nullable()
            .optional()
            .transform((val) => (val === undefined ? undefined : val ? val : null)),
        images: productBaseSchema.shape.images.optional(),
        isFeatured: z.boolean().optional(),
        status: z.enum(["active", "draft"]).optional(),
        tags: z.array(z.string().trim()).optional(),
        hasVariants: z.boolean().optional(),
        variants: z
            .array(variantSchema)
            .optional()
            .transform((variants) => (variants ? expandVariants(variants) : undefined)),
    })
    .superRefine(checkDiscounts);
