import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { createPublicRateLimitMiddleware } from "../security";

const MAX_JSON_BODY = "64kb";

function isSecureRequest(req: express.Request) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwarded = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto?.split(",");
  return req.secure || forwarded?.some((value) => value.trim().toLowerCase() === "https");
}

function securityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  if (process.env.NODE_ENV === "production") {
    const analyticsEndpoint = process.env.VITE_ANALYTICS_ENDPOINT;
    let analyticsOrigin = "";
    try { analyticsOrigin = analyticsEndpoint ? new URL(analyticsEndpoint).origin : ""; } catch { analyticsOrigin = ""; }
    const external = analyticsOrigin ? ` ${analyticsOrigin}` : "";
    res.setHeader("Content-Security-Policy", `default-src 'self'; script-src 'self'${external}; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self'${external}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`);
    if (isSecureRequest(req)) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
}

function requireHttpsInProduction(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (process.env.NODE_ENV !== "production" || isSecureRequest(req)) return next();
  return res.status(400).json({ error: "Secure connection required." });
}

function sameOriginWriteGuard(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.get("origin");
  if (!origin) return next();
  const expectedOrigin = `${isSecureRequest(req) ? "https" : req.protocol}://${req.get("host")}`;
  if (origin === expectedOrigin) return next();
  console.warn(JSON.stringify({ event: "cross_origin_write_blocked", timestamp: new Date().toISOString() }));
  return res.status(403).json({ error: "Something went wrong. Please try again." });
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(requireHttpsInProduction);
  app.use(securityHeaders);
  app.use(express.json({ limit: MAX_JSON_BODY, strict: true }));
  app.use(express.urlencoded({ limit: MAX_JSON_BODY, extended: false }));
  app.use(sameOriginWriteGuard);
  app.use("/api", createPublicRateLimitMiddleware("public-api", 120));
  app.use("/manus-storage", createPublicRateLimitMiddleware("public-storage", 240));
  app.use("/api/trpc", (req, res, next) => {
    if (req.method === "OPTIONS") {
      res.setHeader("Allow", "GET, POST, OPTIONS");
      return res.status(204).end();
    }
    if (req.method === "GET" || req.method === "POST") return next();
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed." });
  });
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  app.use((error: { type?: string; status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (res.headersSent) return;
    const status = error.type === "entity.too.large" || error.status === 413 ? 413 : 400;
    console.warn(JSON.stringify({ event: "request_rejected", status, kind: error.type ?? "unknown", timestamp: new Date().toISOString() }));
    res.status(status).json({ error: status === 413 ? "Request payload too large." : "Something went wrong. Please try again." });
  });

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
