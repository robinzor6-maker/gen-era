import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import productsRouter from "./products.js";
import cartRouter from "./cart.js";
import authRouter from "./auth.js";
import ordersRouter from "./orders.js";
import collectionsRouter from "./collections.js";
import paymentsRouter from "./payments.js";
import webhooksRouter from "./webhooks.js";
import adminRouter from "./admin.js";
import swaggerRouter from "./swagger.js";
import analyticsRouter from "./analytics.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/v1/products",    productsRouter);
router.use("/v1/cart",        cartRouter);
router.use("/v1/auth",        authRouter);
router.use("/v1/orders",      ordersRouter);
router.use("/v1/collections", collectionsRouter);
router.use("/v1/payments",    paymentsRouter);
router.use("/v1/webhooks",    webhooksRouter);
router.use("/v1/admin",       adminRouter);
router.use("/v1/analytics",   analyticsRouter);
router.use("/swagger",        swaggerRouter);

export default router;
