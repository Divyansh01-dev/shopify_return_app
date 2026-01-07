import { Router } from "express";
import {
  createReturnRequest,
  getReturnByOrderId,
  updateReturnStatus,
  verifyOrder,
} from "../controllers/return.controller";

const router = Router();
router.post("/verify-order", verifyOrder);

router.post("/", createReturnRequest);
router.get("/:shop/:orderId", getReturnByOrderId);
router.put("/:id/status", updateReturnStatus);

export default router;
