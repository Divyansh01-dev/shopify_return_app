"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopifyRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const shopifyRequest = (shop, accessToken) => {
    return axios_1.default.create({
        baseURL: `https://${shop}/admin/api/2024-01`,
        headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
        },
    });
};
exports.shopifyRequest = shopifyRequest;
