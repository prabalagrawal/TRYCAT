import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { createApp } from "./_core/index";

describe("Vercel Express adapter", () => {
  it("creates the secured application without opening a listener", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const app = await createApp();

      expect(app.get("x-powered-by")).toBe(false);
      expect(app.get("trust proxy")).toBe(1);
      expect(typeof app.use).toBe("function");
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it("routes Vercel requests through the secured Express function with production assets included", () => {
    const configPath = path.resolve(import.meta.dirname, "..", "vercel.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as {
      functions?: Record<string, { includeFiles?: string }>;
      rewrites?: Array<{ source: string; destination: string }>;
    };

    expect(config.functions?.["server.ts"]?.includeFiles).toBe("dist/public/**");
    expect(config.rewrites).toEqual([{ source: "/(.*)", destination: "/server" }]);
  });
});
