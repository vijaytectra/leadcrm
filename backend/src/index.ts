import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import institutionRoutes from "./routes/institutions";
import subscriptionRoutes from "./routes/subscriptions";
import superAdminRoutes from "./routes/super-admin";
import financeRoutes from "./routes/finance";
import assetRoutes from "./routes/assets";
import roleRoutes from "./routes/roles";
import analyticsRoutes from "./routes/analytics";
import leadRoutes from "./routes/leads";
import settingsRoutes from "./routes/settings";
import formRoutes from "./routes/forms";
import telecallerRoutes from "./routes/telecaller";
import communicationRoutes from "./routes/communications";
import notificationRoutes from "./routes/notifications";
import documentRoutes from "./routes/documents";
import admissionTeamRoutes from "./routes/admission-team";
import admissionHeadRoutes from "./routes/admission-head";
import studentRoutes from "./routes/student";

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// tenancy-aware middleware: extract tenant slug from path prefix /:tenant/
app.use((req, _res, next) => {
  const parts = req.path.split("/").filter(Boolean);
  if (parts.length > 0) {
    (req as { tenantSlug?: string }).tenantSlug = parts[0];
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
app.use("/api/assets", assetRoutes);
app.use("/api", roleRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", leadRoutes);
app.use("/api", formRoutes);
app.use("/api", telecallerRoutes);
app.use("/api", communicationRoutes);
app.use("/api", notificationRoutes);
app.use("/api", documentRoutes);
app.use("/api/:tenantSlug/admission-team", admissionTeamRoutes);
app.use("/api/:tenantSlug/admission-head", admissionHeadRoutes);
app.use("/api/:tenantSlug/student", studentRoutes);

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});
app.use("/api", settingsRoutes);

// Example tenant-aware route
app.get("/:tenant/health", (req, res) => {
  res.json({
    status: "ok",
    tenant: (req as { tenantSlug?: string }).tenantSlug,
  });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});
