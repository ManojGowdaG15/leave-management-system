import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import leaveRoutes from "./routes/leaves.js";
import userRoutes from "./routes/users.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/users", userRoutes);

export default app;