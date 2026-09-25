import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import ProductRoute from "./modules/product/product.route.js";
import ComboRoute from "./modules/combo/combo.routes.js";
import OrderRoute from "./modules/order/order.routes.js";
import FavoriteRoute from "./modules/favorite/favorite.routes.js";
import ReviewsRoute from "./modules/reviews/reviews.route.js";

const createApp = (auth) => {
    const app = express();

    app.use(cors({
        origin: [
            process.env.FRONTEND_URL,
            "http://localhost:3000",
        ].filter(Boolean),
        credentials: true
    }));

    app.use(cookieParser());
    app.use(express.json());

    app.all("/api/auth/*splat", toNodeHandler(auth));

    app.use("/api/product", ProductRoute);
    app.use("/api/combo", ComboRoute);
    app.use("/api/order", OrderRoute);
    app.use("/api/favorite", FavoriteRoute);
    app.use("/api/reviews", ReviewsRoute);

    app.get("/", (req, res) => {
        res.send("M traders server is running successfully");
    });

    return app;
}

export default createApp;