import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import returnRoutes from "./routes/return.routes";
import storeRoutes from "./routes/store.routes";
dotenv.config();

const app = express();
const baseUrl = "api";

app.use(cors());
app.use(express.json());
app.use("/api/store", storeRoutes);
app.use("/api/returns", returnRoutes);
app.get("/", (_, res) => {
  return res.status(200).json("Server is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
