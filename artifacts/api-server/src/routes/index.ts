import { Router, type IRouter } from "express";
import healthRouter from "./health";
import groqRouter from "./groq";
import geminiRouter from "./gemini";

const router: IRouter = Router();

router.use(healthRouter);
router.use(groqRouter);
router.use(geminiRouter);

export default router;
