import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import authRouter from "./auth";
import ordersRouter from "./orders";
import collectionsRouter from "./collections";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/v1/products",    productsRouter);
router.use("/v1/auth",        authRouter);
router.use("/v1/orders",      ordersRouter);
router.use("/v1/collections", collectionsRouter);

export default router;
