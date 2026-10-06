import mongoose from "mongoose";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Product from "../product/product.model.js";
import Combo from "../combo/combo.model.js";
import Order from "./order.model.js";
import { createOrderSchema, updateOrderStatusSchema } from "./order.validation.js";

const SHIPPING_CHARGES = {
    inside_dhaka: 70,
    outside_dhaka: 130,
};

const generateTrackingId = async () => {
    let trackingId = "";
    let isUnique = false;

    while (!isUnique) {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        trackingId = `TRK-${randomNum}`;

        const existingOrder = await Order.exists({ trackingId });
        if (!existingOrder) {
            isUnique = true;
        }
    }
    return trackingId;
};

export const createOrder = catchAsync(async (req, res) => {
    const validationResult = createOrderSchema.safeParse(req.body);

    if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || "Invalid input data";
        throw new AppError(400, errorMessage);
    }

    const { orderType, name, phone, address, deliveryLocation, note, items } = validationResult.data;

    let itemsSubtotal = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
        if (orderType === "combo") {
            const combo = await Combo.findOne({ slug: item.slug });

            if (!combo) {
                throw new AppError(404, `Combo package not found with slug: ${item.slug}`);
            }

            if (combo.status && combo.status !== "active") {
                throw new AppError(400, `Combo package "${combo.title}" is not available right now`);
            }

            const unitPrice = combo.comboPrice;
            itemsSubtotal += unitPrice * item.quantity;

            verifiedOrderItems.push({
                productId: combo._id,
                itemType: "combo",
                title: combo.title,
                image: combo.bannerImage || combo.images?.[0] || "",
                price: unitPrice,
                quantity: item.quantity,
                variantSku: null,
            });
        } else {
            const product = await Product.findOne({ slug: item.slug });

            if (!product) {
                throw new AppError(404, `Product not found with slug: ${item.slug}`);
            }

            if (product.status && product.status !== "active") {
                throw new AppError(400, `Product "${product.titleEn || product.titleBn}" is not available right now`);
            }

            let basePrice = product.price || 0;

            if (item.variantSku && product.hasVariants) {
                const variant = product.variants?.find((v) => v.sku === item.variantSku);
                if (variant && variant.price && variant.price > 0) {
                    basePrice = variant.price;
                }
            }

            const finalUnitPrice =
                product.discountRate > 0
                    ? Math.round(basePrice - (basePrice * product.discountRate) / 100)
                    : basePrice;

            itemsSubtotal += finalUnitPrice * item.quantity;

            verifiedOrderItems.push({
                productId: product._id,
                itemType: "product",
                title: product.titleBn || product.titleEn,
                image: product.images?.[0] || "",
                price: finalUnitPrice,
                quantity: item.quantity,
                variantSku: item.variantSku || null,
            });
        }
    }

    const shippingCharge = SHIPPING_CHARGES[deliveryLocation] || 0;
    const calculatedTotalPrice = itemsSubtotal + shippingCharge;

    const trackingId = await generateTrackingId();

    const newOrder = await Order.create({
        trackingId,
        orderType,
        name,
        phone,
        address,
        deliveryLocation,
        shippingCharge,
        note: note || "",
        items: verifiedOrderItems,
        totalPrice: calculatedTotalPrice,
        paymentMethod: "COD",
    });

    res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: newOrder,
    });
});


export const trackOrderGuest = catchAsync(async (req, res) => {
    const { trackingId } = req.query;

    if (!trackingId) {
        throw new AppError(400, "Tracking ID is required to track order");
    }

    const order = await Order.findOne({ trackingId: trackingId.trim().toUpperCase() });

    if (!order) {
        throw new AppError(404, "No order found with this tracking ID");
    }

    res.status(200).json({
        success: true,
        message: "Order details fetched successfully",
        data: order,
    });
});

export const getAllOrders = catchAsync(async (req, res) => {
    const { status, orderType, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) {
        filter.status = status;
    }

    if (orderType === "single") {
        filter.$or = [
            { orderType: "single" },
            { orderType: { $exists: false } },
            { orderType: null },
        ];
    } else if (orderType === "combo") {
        filter.orderType = "combo";
    }

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
            totalPages: Math.ceil(total / Number(limit)) || 1,
        },
        data: orders,
    });
});

export const getSingleOrder = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(400, "Invalid Order ID format");
    }

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(400, "Invalid Order ID format");
    }

    const validationResult = updateOrderStatusSchema.safeParse(req.body);
    if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || "Invalid status";
        throw new AppError(400, errorMessage);
    }

    const { status } = validationResult.data;

    const order = await Order.findById(id);
    if (!order) {
        throw new AppError(404, "Order not found");
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(400, "Invalid Order ID format");
    }

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