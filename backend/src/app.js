import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import leaveRoutes from "./routes/leave.js";
import expenseRoutes from "./routes/expense.js";
import managerRoutes from "./routes/manager.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/leaves", leaveRoutes);
app.use("/expenses", expenseRoutes);
app.use("/manager", managerRoutes);

export default app;
