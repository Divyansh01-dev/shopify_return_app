"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const return_routes_1 = __importDefault(require("./routes/return.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const baseUrl = "api";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(`${baseUrl}/return`, return_routes_1.default);
app.use(`${baseUrl}/admin`, admin_routes_1.default);
app.get("/", (_, res) => {
    return res.status(200).json("Server is running");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
