import { z } from "zod";

export const createOrderValidationSchema = z.object({
    name: z.string({
        required_error: "Name is required",
    }),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    phone: z.string({
        required_error: "Phone number is required",
    }),
    address: z.string({
        required_error: "Address is required",
    }),
    items: z
        .array(
            z.object({
                productId: z.string({
                    required_error: "Product ID is required",
                }),
                quantity: z
                    .number({
                        required_error: "Quantity is required",
                    })
                    .min(1, "Quantity must be at least 1"),
                price: z.number({
                    required_error: "Price is required",
                }),
            })
        )
        .min(1, "Order must contain at least one item"),
    paymentMethod: z.enum(["COD", "Online"]).optional().default("COD"),
});

export const updateOrderStatusValidationSchema = z.object({
    status: z.enum(["Pending", "Processing", "Delivered", "Cancelled"], {
        required_error: "Status is required",
    }),
});