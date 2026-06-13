import express from "express";

const router = express.Router();
const PYTHON_ENGINE_URL =
  process.env.PYTHON_ENGINE_URL?.trim() || "http://127.0.0.1:8000";

async function forward(res, path, options = {}) {
  try {
    const response = await fetch(`${PYTHON_ENGINE_URL}${path}`, options);
    const bodyText = await response.text();
    const isJson =
      response.headers.get("content-type")?.includes("application/json") ?? false;

    if (!response.ok) {
      let errorBody = { detail: bodyText || "Request failed." };
      if (isJson) {
        try {
          errorBody = JSON.parse(bodyText);
        } catch {
          errorBody = { detail: bodyText || "Request failed." };
        }
      }

      res.status(response.status).json(errorBody);
      return;
    }

    if (!bodyText) {
      res.status(204).send();
      return;
    }

    if (isJson) {
      try {
        res.status(response.status).json(JSON.parse(bodyText));
      } catch {
        res.status(502).json({ detail: "Python engine returned invalid JSON." });
      }
      return;
    }

    res.status(response.status).json({ data: bodyText });
  } catch (error) {
    res.status(503).json({
      detail:
        error instanceof Error
          ? `Python engine request failed: ${error.message}`
          : "Python engine is unavailable. Start it with `npm run python-engine` and retry.",
    });
  }
}

router.get("/health", async (_req, res) => {
  await forward(res, "/health");
});

router.get("/resources", async (_req, res) => {
  await forward(res, "/resources");
});

router.post("/resources/upload", async (req, res) => {
  await forward(res, "/resources/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body ?? {}),
  });
});

router.post("/ocr/parse", async (req, res) => {
  await forward(res, "/ocr/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body ?? {}),
  });
});

router.delete("/resources/:resourceId", async (req, res) => {
  await forward(res, `/resources/${req.params.resourceId}`, { method: "DELETE" });
});

router.post("/agent/ask", async (req, res) => {
  await forward(res, "/agent/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body ?? {}),
  });
});

export default router;
