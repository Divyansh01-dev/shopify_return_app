import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import returnRoutes from "./routes/return.routes";
import admin from "./routes/admin.routes";
dotenv.config();

const app = express();
const baseUrl = "api";

app.use(cors());
app.use(express.json());
app.use(`${baseUrl}/return`, returnRoutes);
app.use(`${baseUrl}/admin`, admin);
app.get("/", (_, res) => {
  return res.status(200).json("Server is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
