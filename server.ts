/**
 * Vercel function entry: export the secured Express application rather than
 * opening a long-running listener. Local development continues to use
 * server/_core/index.ts through the existing pnpm scripts.
 */
import { createApp } from "./server/_core/index";

const app = await createApp();

export default app;
