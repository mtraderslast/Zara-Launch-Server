import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Product from "../product/product.model.js";
import Order from "./order.model.js";

export const createOrder = catchAsync(async (req, res) => {
    const { name, email, phone, address, items, paymentMethod } = req.body;

    let calculatedTotalPrice = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
        const product = await Product.findById(item.productId);

        if (!product) {
            throw new AppError(404, `Product not found with ID: ${item.productId}`);
        }

        if (product.status !== "active") {
            throw new AppError(400, `Product "${product.titleEn}" is not available right now`);
        }

        const itemPrice =
            product.discountRate > 0
                ? Math.round(product.price - (product.price * product.discountRate) / 100)
                : product.price;

        if (item.variantSku && product.variants?.length > 0) {
            const variant = product.variants.find((v) => v.sku === item.variantSku);

            if (!variant) {
                throw new AppError(404, `Variant ${item.variantSku} not found for ${product.titleEn}`);
            }

            if (variant.stock < item.quantity) {
                throw new AppError(400, `Insufficient stock for ${product.titleEn} (${item.variantSku})`);
            }

            variant.stock -= item.quantity;
            await product.save();
        }

        calculatedTotalPrice += itemPrice * item.quantity;

        verifiedOrderItems.push({
            productId: product._id,
            title: product.titleEn,
            image: product.images?.[0] || "",
            price: itemPrice,
            quantity: item.quantity,
            variantSku: item.variantSku || null,
        });
    }

    const newOrder = await Order.create({
        name,
        email: email.toLowerCase(),
        phone,
        address,
        items: verifiedOrderItems,
        totalPrice: calculatedTotalPrice,
        paymentMethod: paymentMethod || "COD",
    });

    res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: newOrder,
    });
});


export const getMyOrders = catchAsync(async (req, res) => {
    const userEmail = req.user?.email;

    if (!userEmail) {
        throw new AppError(401, "User email not found in session");
    }

    const orders = await Order.find({ email: userEmail.toLowerCase() }).sort({
        createdAt: -1,
    });

    res.status(200).json({
        success: true,
        message: "My orders fetched successfully",
        data: orders,
    });
});


export const trackOrderGuest = catchAsync(async (req, res) => {
    const { orderId, phone } = req.query;

    if (!orderId || !phone) {
        throw new AppError(400, "Order ID and Phone number are required to track order");
    }

    const order = await Order.findOne({ _id: orderId, phone });

    if (!order) {
        throw new AppError(404, "No order found with the provided details");
    }

    res.status(200).json({
        success: true,
        message: "Order status fetched successfully",
        data: order,
    });
});


export const getAllOrders = catchAsync(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        Order.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
        data: orders,
    });
});


export const getSingleOrder = catchAsync(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findById(id);
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

    const order = await Order.findById(id);
    if (!order) {
        throw new AppError(404, "Order not found");
    }

    if (status === "Cancelled" && order.status !== "Cancelled") {
        for (const item of order.items) {
            if (item.variantSku) {
                await Product.updateOne(
                    { _id: item.productId, "variants.sku": item.variantSku },
                    { $inc: { "variants.$.stock": item.quantity } }
                );
            }
        }
    }

    order.status = status;

    if (status === "Delivered" && order.paymentMethod === "COD") {
        order.paymentStatus = "Paid";
    }

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