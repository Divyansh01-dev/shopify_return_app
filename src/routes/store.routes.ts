import { Router } from "express";
import {
  getAllReturnsByStore,
  registerStore,
} from "../controllers/store.controller";

const router = Router();

router.post("/install", registerStore);
router.get("/store/:shop", getAllReturnsByStore);
export default router;
