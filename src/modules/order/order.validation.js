import { z } from "zod";

export const createOrderSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, "Customer name is required"),
        email: z
            .string()
            .trim()
            .email("Valid email is required for tracking orders"),
        phone: z.string().trim().min(1, "Phone number is required"),
        address: z.string().trim().min(1, "Delivery address is required"),
        paymentMethod: z.enum(["COD", "Online"]).default("COD"),
        items: z
            .array(
                z.object({
                    productId: z.string().min(1, "Product ID is required"),
                    quantity: z
                        .number()
                        .int("Quantity must be a whole number")
                        .min(1, "Quantity must be at least 1"),
                    variantSku: z.string().optional(),
                })
            )
            .min(1, "Order must contain at least one item"),
    }),
});

export const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.enum(["Pending", "Processing", "Delivered", "Cancelled"], {
            required_error: "Status is required",
        }),
    }),
});