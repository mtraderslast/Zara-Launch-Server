import AppError from "./AppError.js";

const isProduction = process.env.NODE_ENV === "production";

// অজানা রুটের জন্য 404 হ্যান্ডলার
export const notFoundHandler = (req, res, next) => {
    next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// বিভিন্ন ধরনের এরর (Zod, Mongoose, MongoDB, JSON parse) কে একটি সুন্দর
// (statusCode, message) জোড়ায় রূপান্তর করে।
const normalizeError = (err) => {
    // Zod ভ্যালিডেশন এরর
    if (err?.name === "ZodError" && Array.isArray(err.issues)) {
        const first = err.issues[0];
        const path = first?.path?.length ? `${first.path.join(".")}: ` : "";
        return { statusCode: 400, message: `${path}${first?.message || "Invalid input data"}` };
    }

    // ভুল ObjectId বা ভুল টাইপ (যেমন /api/product/admin/abc)
    if (err?.name === "CastError") {
        return { statusCode: 400, message: `Invalid ${err.path || "value"}: ${err.value}` };
    }

    // Mongoose স্কিমা ভ্যালিডেশন এরর
    if (err?.name === "ValidationError" && err.errors) {
        const first = Object.values(err.errors)[0];
        return { statusCode: 400, message: first?.message || "Validation failed" };
    }

    // Duplicate key (যেমন একই slug)
    if (err?.code === 11000) {
        const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
        return { statusCode: 409, message: `A record with this ${field} already exists` };
    }

    // ভাঙা JSON বডি
    if (err?.type === "entity.parse.failed") {
        return { statusCode: 400, message: "Invalid JSON in request body" };
    }

    if (err instanceof AppError || err?.statusCode) {
        return { statusCode: err.statusCode, message: err.message };
    }

    return { statusCode: 500, message: "Something went wrong!" };
};

const globalErrorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const { statusCode, message } = normalizeError(err);

    if (statusCode >= 500) {
        console.error("Unhandled Error:", err);
    }

    res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 && isProduction ? "Something went wrong!" : message,
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
    });
};

export default globalErrorHandler;
