import { z } from "zod";

export const createOrderSchema = z.object({
    orderType: z.enum(["single", "combo"]).default("single"),
    name: z.string().trim().min(1, "Customer name is required"),
    phone: z.string().trim().min(1, "Phone number is required"),
    address: z.string().trim().min(1, "Delivery address is required"),
    deliveryLocation: z.enum(["inside_dhaka", "outside_dhaka"], {
        required_error: "Delivery location is required",
    }),
    note: z.string().optional().default(""),
    items: z
        .array(
            z.object({
                slug: z.string().min(1, "Slug is required"),
                quantity: z
                    .number()
                    .int("Quantity must be a whole number")
                    .min(1, "Quantity must be at least 1"),
                variantSku: z.string().nullable().optional(),
            })
        )
        .min(1, "Order must contain at least one item"),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(["Pending", "Processing", "Delivered", "Cancelled"], {
        required_error: "Status is required",
    }),
});