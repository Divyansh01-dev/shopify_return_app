"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReturnAction = exports.getAllReturns = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const getAllReturns = async (req, res) => {
    try {
        const returns = await prisma_1.default.return.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                order: true,
                items: true,
            },
        });
        res.json(returns);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch returns" });
    }
};
exports.getAllReturns = getAllReturns;
const handleReturnAction = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;
    try {
        const returnData = await prisma_1.default.return.findUnique({ where: { id } });
        if (!returnData || !returnData.shopifyId) {
            return res.status(404).json({ error: "Return or Shopify ID not found" });
        }
        const mutation = action === "APPROVE"
            ? `mutation { returnApproveRequest(input: { id: "${returnData.shopifyId}" }) { return { status } userErrors { message } } }`
            : `mutation { returnDeclineRequest(input: { id: "${returnData.shopifyId}" }) { return { status } userErrors { message } } }`;
        const shopifyResponse = await fetch(`https://${process.env.SHOP_DOMAIN}/admin/api/2026-01/graphql.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify({ query: mutation }),
        });
        const result = await shopifyResponse.json();
        if (result.errors) {
            throw new Error(`Shopify API error: ${JSON.stringify(result.errors)}`);
        }
        const finalStatus = action === "APPROVE" ? "APPROVED" : "DECLINED";
        const updatedRecord = await prisma_1.default.return.update({
            where: { id },
            data: { status: finalStatus },
        });
        res.json({ message: `Return ${action} successful`, updatedRecord });
    }
    catch (error) {
        res.status(500).json({ error: "Action failed", details: error });
    }
};
exports.handleReturnAction = handleReturnAction;
