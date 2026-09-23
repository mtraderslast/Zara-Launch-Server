import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required"],
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
            required: [true, "Product price at purchase is required"],
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
        name: {
            type: String,
            required: [true, "Customer name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required for order tracking"],
            trim: true,
            lowercase: true,
            index: true,
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
        items: {
            type: [orderItemSchema],
            required: [true, "Order items are required"],
        },
        totalPrice: {
            type: Number,
            required: [true, "Total price is required"],
            min: 0,
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