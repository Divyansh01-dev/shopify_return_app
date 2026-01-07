import { Router } from "express";
import * as ReturnController from "../controllers/return.controller";

const router = Router();

router.post("/orders/sync", ReturnController.syncOrder);

router.post("/returns", ReturnController.createReturn);
router.get("/returns/:id", ReturnController.getReturnDetails);
router.patch("/returns/:id/status", ReturnController.updateReturnStatus);

export default router;
