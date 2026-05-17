import { Router, type IRouter } from "express";
import cookieParser from "cookie-parser";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import ordersRouter from "./orders";
import bannersRouter from "./banners";
import settingsRouter from "./settings";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(cookieParser(process.env.SESSION_SECRET || "shopeasy-secret"));

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(bannersRouter);
router.use(settingsRouter);
router.use(storageRouter);

export default router;
