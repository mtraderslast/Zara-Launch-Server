import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import Combo from "./combo.model.js";


export const createCombo = catchAsync(async (req, res) => {
    const existingCombo = await Combo.findOne({ slug: req.body.slug });
    if (existingCombo) {
        throw new AppError(400, "A combo package with this slug already exists");
    }

    const combo = await Combo.create(req.body);

    res.status(201).json({
        success: true,
        message: "Combo package created successfully",
        data: combo,
    });
});

export const getActiveCombos = catchAsync(async (req, res) => {
    const combos = await Combo.find({ isActive: true })
        .populate({
            path: "products.productId",
            select: "titleEn titleBn price images status slug",
        })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: "Active combos fetched successfully",
        data: combos,
    });
});

export const getComboBySlug = catchAsync(async (req, res) => {
    const { slug } = req.params;

    const combo = await Combo.findOne({ slug, isActive: true }).populate({
        path: "products.productId",
        select: "titleEn titleBn price images status slug",
    });

    if (!combo) {
        throw new AppError(404, "Combo package not found or currently unavailable");
    }

    res.status(200).json({
        success: true,
        message: "Combo package details fetched successfully",
        data: combo,
    });
});

export const getAllCombosForAdmin = catchAsync(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [combos, total] = await Promise.all([
        Combo.find()
            .populate({
                path: "products.productId",
                select: "titleEn price images",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Combo.countDocuments(),
    ]);

    res.status(200).json({
        success: true,
        message: "All combos fetched successfully for admin",
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
        data: combos,
    });
});

export const updateCombo = catchAsync(async (req, res) => {
    const { id } = req.params;

    const combo = await Combo.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!combo) {
        throw new AppError(404, "Combo package not found");
    }

    res.status(200).json({
        success: true,
        message: "Combo package updated successfully",
        data: combo,
    });
});

export const deleteCombo = catchAsync(async (req, res) => {
    const { id } = req.params;

    const combo = await Combo.findByIdAndDelete(id);
    if (!combo) {
        throw new AppError(404, "Combo package not found");
    }

    res.status(200).json({
        success: true,
        message: "Combo package deleted successfully",
        data: null,
    });
});