import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Product from "../product/product.model.js";
import Order from "./order.model.js";


export const createOrder = catchAsync(async (req, res) => {
    const { name, email, phone, address, items, paymentMethod } = req.body;

    let calculatedTotalPrice = 0;

    // Query database for each product and calculate total price
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            throw new AppError(404, `Product not found with ID: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
            throw new AppError(
                400,
                `Insufficient stock for product: ${product.name}`
            );
        }

        calculatedTotalPrice += product.price * item.quantity;
    }

    // Create order with calculated total price
    const newOrder = await Order.create({
        name,
        email: email || "",
        phone,
        address,
        items,
        totalPrice: calculatedTotalPrice,
        paymentMethod: paymentMethod || "COD",
    });

    // Deduct quantity from product stock
    for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
        });
    }

    res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: newOrder,
    });
});


export const getAllOrders = catchAsync(async (req, res) => {
    const orders = await Order.find()
        .populate("items.productId", "name price image")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        data: orders,
    });
});


export const getSingleOrder = catchAsync(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findById(id).populate(
        "items.productId",
        "name price image"
    );

    if (!order) {
        throw new AppError(404, "Order not found");
    }

    res.status(200).json({
        success: true,
        message: "Order details fetched successfully",
        data: order,
    });
});

export const updateOrderStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Processing", "Delivered", "Cancelled"];
    if (!status || !validStatuses.includes(status)) {
        throw new AppError(400, "Invalid status provided");
    }

    const order = await Order.findById(id);
    if (!order) {
        throw new AppError(404, "Order not found");
    }

    order.status = status;
    await order.save();

    res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order,
    });
});

export const deleteOrder = catchAsync(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);
    if (!order) {
        throw new AppError(404, "Order not found");
    }

    res.status(200).json({
        success: true,
        message: "Order deleted successfully",
        data: null,
    });
});