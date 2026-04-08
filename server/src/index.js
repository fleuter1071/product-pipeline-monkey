import cors from "cors";
import express from "express";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "product-pipeline-monkey-server",
    message: "Server scaffold is running.",
  });
});

app.get("/api/requests", (_req, res) => {
  res.json({
    items: [],
    note: "Request API scaffold only. Supabase integration comes next.",
  });
});

app.listen(port, () => {
  console.log(`Product Pipeline Monkey server listening on port ${port}`);
});
