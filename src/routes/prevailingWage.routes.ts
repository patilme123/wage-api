import { Router } from "express";
import { calculateWage } from "../controllers/prevailingWage.controller.js";

const prevailingWageRouter = Router();

prevailingWageRouter.post("/calculate", calculateWage);

export default prevailingWageRouter;
