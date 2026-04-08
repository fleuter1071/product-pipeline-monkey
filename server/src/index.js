import "dotenv/config";
import cors from "cors";
import express from "express";
import { createRequestStore } from "./requestStore.js";

const app = express();
const port = process.env.PORT || 4000;
const requestStore = createRequestStore();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "product-pipeline-monkey-server",
    storage: requestStore.mode,
    message:
      requestStore.mode === "supabase"
        ? "Server is running with Supabase."
        : "Server is running with the in-memory fallback store.",
  });
});

app.get("/api/requests", async (_req, res) => {
  try {
    const items = await requestStore.listRequests();
    res.json({ items, storage: requestStore.mode });
  } catch (error) {
    res.status(500).json({
      error: "Failed to load requests.",
      detail: error.message,
    });
  }
});

app.post("/api/requests", async (req, res) => {
  try {
    const item = await requestStore.createRequest(req.body);
    res.status(201).json({ item });
  } catch (error) {
    const statusCode = error.message?.includes("required") ? 400 : 500;
    res.status(statusCode).json({
      error: "Failed to create request.",
      detail: error.message,
    });
  }
});

app.patch("/api/requests/:id", async (req, res) => {
  try {
    const item = await requestStore.updateRequest(req.params.id, req.body);

    if (!item) {
      return res.status(404).json({ error: "Request not found." });
    }

    return res.json({ item });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to update request.",
      detail: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Product Pipeline Monkey server listening on port ${port}`);
});
