"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReturnStatus = exports.getReturnDetails = exports.createReturn = exports.syncOrder = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const syncOrder = async (req, res) => {
    try {
        const { id, orderNumber, customerEmail, totalPrice, currencyCode, line_items, } = req.body;
        const order = await prisma_1.default.order.upsert({
            where: { id: id },
            update: {
                customerEmail,
                totalPrice,
            },
            create: {
                id,
                orderNumber,
                customerEmail,
                totalPrice,
                currencyCode,
                lineItems: {
                    create: line_items.map((item) => ({
                        id: item.admin_graphql_api_id,
                        productId: `gid://shopify/Product/${item.product_id}`,
                        variantId: `gid://shopify/ProductVariant/${item.variant_id}`,
                        title: item.title,
                        variantTitle: item.variant_title,
                        quantity: item.quantity,
                        price: item.price,
                        sku: item.sku,
                    })),
                },
            },
        });
        res.status(200).json({ message: "Order and items synced", order });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Sync failed" });
    }
};
exports.syncOrder = syncOrder;
const createReturn = async (req, res) => {
    try {
        const { orderId, reason, items } = req.body;
        const newReturn = await prisma_1.default.return.create({
            data: {
                orderId: orderId,
                reason: reason,
                status: "REQUESTED",
                items: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        name: item.name,
                        sku: item.sku,
                    })),
                },
            },
            include: {
                items: true,
            },
        });
        res.status(201).json(newReturn);
    }
    catch (error) {
        res.status(500).json({ error: "Could not create return request" });
    }
};
exports.createReturn = createReturn;
const getReturnDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const returnRequest = await prisma_1.default.return.findUnique({
            where: { id },
            include: {
                items: true,
                order: true,
            },
        });
        if (!returnRequest) {
            return res.status(404).json({ error: "Return request not found" });
        }
        res.json(returnRequest);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching return details" });
    }
};
exports.getReturnDetails = getReturnDetails;
const updateReturnStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedReturn = await prisma_1.default.return.update({
            where: { id },
            data: { status },
        });
        res.json(updatedReturn);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
};
exports.updateReturnStatus = updateReturnStatus;
