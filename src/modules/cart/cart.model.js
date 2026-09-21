import mongoose, { Schema } from "mongoose";


const orderItemSchema = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required"],
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
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
            default: "",
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
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
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "Online"],
            default: "COD",
        },
        status: {
            type: String,
            enum: ["Pending", "Processing", "Delivered", "Cancelled"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


const Order = mongoose.model("Order", orderSchema);
export default Order;