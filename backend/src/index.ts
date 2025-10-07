import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import institutionRoutes from "./routes/institutions";
import subscriptionRoutes from "./routes/subscriptions";
import superAdminRoutes from "./routes/super-admin";
import financeRoutes from "./routes/finance";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// tenancy-aware middleware: extract tenant slug from path prefix /:tenant/
app.use((req, _res, next) => {
  const parts = req.path.split("/").filter(Boolean);
  if (parts.length > 0) {
    (req as any).tenantSlug = parts[0];
  }
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api/super-admin/institutions", institutionRoutes);
app.use("/api/super-admin/subscriptions", subscriptionRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/finance", financeRoutes);

// Example tenant-aware route
app.get("/:tenant/health", (req, res) => {
  res.json({ status: "ok", tenant: (req as any).tenantSlug });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});
