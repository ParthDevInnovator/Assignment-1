import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { PORT } from "./config";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import storeRoutes from "./routes/store.routes";
import ratingRoutes from "./routes/rating.routes";
import ownerRoutes from "./routes/owner.routes";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/owner", ownerRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
