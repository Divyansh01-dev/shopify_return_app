"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReturnStatus = exports.getReturnByOrderId = exports.createReturnRequest = exports.verifyOrder = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const shopifyClient_1 = require("../utils/shopifyClient");
const verifyOrder = async (req, res) => {
    try {
        const { shop, orderName, email } = req.body;
        const store = await prisma_1.default.store.findUnique({ where: { shop } });
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }
        const shopify = (0, shopifyClient_1.shopifyRequest)(store.shop, store.accessToken);
        const { data } = await shopify.get("/orders.json", {
            params: { name: orderName, status: "any" },
        });
        const order = data.orders?.[0];
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.email?.toLowerCase() !== email.toLowerCase()) {
            return res.status(400).json({ message: "Email does not match" });
        }
        if (order.financial_status !== "paid") {
            return res.status(400).json({ message: "Order is not paid" });
        }
        if (order.fulfillment_status !== "fulfilled") {
            return res.status(400).json({ message: "Order is not fulfilled" });
        }
        res.status(200).json({
            verified: true,
            order,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Order verification failed" });
    }
};
exports.verifyOrder = verifyOrder;
const createReturnRequest = async (req, res) => {
    try {
        const { shop, orderId, orderName, email, items } = req.body;
        const store = await prisma_1.default.store.findUnique({ where: { shop } });
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }
        const existing = await prisma_1.default.returnRequest.findUnique({
            where: {
                orderId_storeId: {
                    orderId,
                    storeId: store.id,
                },
            },
        });
        if (existing) {
            return res.status(400).json({
                message: "Return request already exists for this order",
            });
        }
        const returnRequest = await prisma_1.default.returnRequest.create({
            data: {
                orderId,
                orderName,
                email,
                storeId: store.id,
                items: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        variantId: item.variantId ?? null,
                        title: item.title,
                        quantity: item.quantity,
                    })),
                },
            },
            include: { items: true },
        });
        res.status(201).json(returnRequest);
    }
    catch {
        res.status(500).json({ message: "Failed to create return request" });
    }
};
exports.createReturnRequest = createReturnRequest;
const getReturnByOrderId = async (req, res) => {
    try {
        const { shop, orderId } = req.params;
        const store = await prisma_1.default.store.findUnique({ where: { shop } });
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }
        const returnRequest = await prisma_1.default.returnRequest.findUnique({
            where: {
                orderId_storeId: {
                    orderId,
                    storeId: store.id,
                },
            },
            include: { items: true },
        });
        if (!returnRequest) {
            return res.status(404).json({ message: "Return not found" });
        }
        res.json(returnRequest);
    }
    catch {
        res.status(500).json({ message: "Failed to fetch return" });
    }
};
exports.getReturnByOrderId = getReturnByOrderId;
const updateReturnStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma_1.default.returnRequest.update({
            where: { id },
            data: { status },
            include: { items: true },
        });
        res.json(updated);
    }
    catch {
        res.status(500).json({ message: "Failed to update status" });
    }
};
exports.updateReturnStatus = updateReturnStatus;
