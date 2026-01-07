"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_controller_1 = require("../controllers/store.controller");
const router = (0, express_1.Router)();
router.post("/install", store_controller_1.registerStore);
router.get("/store/:shop", store_controller_1.getAllReturnsByStore);
exports.default = router;
