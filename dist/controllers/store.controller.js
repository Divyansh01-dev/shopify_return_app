"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReturnsByStore = exports.registerStore = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const registerStore = async (req, res) => {
    try {
        const { shop, accessToken } = req.body;
        if (!shop || !accessToken) {
            return res.status(400).json({ message: "Missing shop or accessToken" });
        }
        const store = await prisma_1.default.store.upsert({
            where: { shop },
            update: { accessToken },
            create: { shop, accessToken },
        });
        res.status(200).json(store);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to register store" });
    }
};
exports.registerStore = registerStore;
const getAllReturnsByStore = async (req, res) => {
    try {
        const { shop } = req.params;
        const store = await prisma_1.default.store.findUnique({ where: { shop } });
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }
        const returns = await prisma_1.default.returnRequest.findMany({
            where: { storeId: store.id },
            include: { items: true },
            orderBy: { createdAt: "desc" },
        });
        res.json({
            shop: store.shop,
            total: returns.length,
            returns,
        });
    }
    catch {
        res.status(500).json({ message: "Failed to fetch returns" });
    }
};
exports.getAllReturnsByStore = getAllReturnsByStore;
