import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            required: [true, "Product ID is required"],
        },
        itemType: {
            type: String,
            enum: ["product", "combo"],
            default: "product",
        },
        title: {
            type: String,
            required: [true, "Product title is required"],
        },
        image: {
            type: String,
            default: "",
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
        },
        variantSku: {
            type: String,
            trim: true,
            default: null,
        },
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        // নতুন যুক্ত করা একমাত্র ফিল্ড
        trackingId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },
        orderType: {
            type: String,
            enum: ["single", "combo"],
            default: "single",
        },
        name: {
            type: String,
            required: [true, "Customer name is required"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            index: true,
        },
        address: {
            type: String,
            required: [true, "Delivery address is required"],
            trim: true,
        },
        deliveryLocation: {
            type: String,
            enum: ["inside_dhaka", "outside_dhaka"],
            required: [true, "Delivery location is required"],
        },
        shippingCharge: {
            type: Number,
            required: true,
            default: 0,
        },
        items: {
            type: [orderItemSchema],
            required: [true, "Order items are required"],
        },
        totalPrice: {
            type: Number,
            required: [true, "Total price is required"],
            min: 0,
        },
        note: {
            type: String,
            trim: true,
            default: "",
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "Online"],
            default: "COD",
        },
        paymentStatus: {
            type: String,
            enum: ["Unpaid", "Paid"],
            default: "Unpaid",
        },
        status: {
            type: String,
            enum: ["Pending", "Processing", "Delivered", "Cancelled"],
            default: "Pending",
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;