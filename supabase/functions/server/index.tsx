import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const STATE_KEY = "pos:state:v1";

app.get("/make-server-bb16b347/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/make-server-bb16b347/state", async (c) => {
  try {
    const state = await kv.get(STATE_KEY);
    return c.json({ state: state ?? null });
  } catch (error) {
    console.log(`Error loading POS state from KV store: ${error}`);
    return c.json({ error: `Failed to load POS state: ${error}` }, 500);
  }
});

app.post("/make-server-bb16b347/state", async (c) => {
  try {
    const body = await c.req.json();
    if (!body || typeof body !== "object" || !body.state) {
      return c.json({ error: "Missing 'state' in request body" }, 400);
    }
    await kv.set(STATE_KEY, body.state);
    return c.json({ ok: true });
  } catch (error) {
    console.log(`Error saving POS state to KV store: ${error}`);
    return c.json({ error: `Failed to save POS state: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);
