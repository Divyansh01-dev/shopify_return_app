import { Router } from "express";
import * as AdminController from "../controllers/admin.controller";

const router = Router();

router.get("/returns", AdminController.getAllReturns);

router.post("/returns/:id/action", AdminController.handleReturnAction);

export default router;
