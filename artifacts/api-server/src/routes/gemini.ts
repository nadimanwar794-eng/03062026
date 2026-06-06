import { Router, type IRouter } from "express";

const router: IRouter = Router();

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1/models";

router.post("/gemini", async (req, res) => {
  try {
    const { model, contents, generationConfig, safetySettings, key, tools, toolConfig } =
      req.body;

    const modelToUse = model || "gemini-1.5-flash";

    let apiKey = key;
    if (!apiKey) {
      const keysRaw =
        process.env["GEMINI_API_KEYS"] || process.env["GEMINI_API_KEY"];
      if (keysRaw) {
        const keys = keysRaw
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);
        if (keys.length > 0) {
          apiKey = keys[Math.floor(Math.random() * keys.length)];
        }
      }
    }

    if (!apiKey) {
      res.status(500).json({
        error:
          "Server Configuration Error: No valid Gemini keys found. Please set GEMINI_API_KEYS in Replit Secrets.",
      });
      return;
    }

    const endpoint = `${GEMINI_BASE_URL}/${modelToUse}:generateContent?key=${apiKey}`;

    const payload: Record<string, unknown> = {
      contents,
      generationConfig,
      safetySettings,
      tools,
      toolConfig,
    };

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      res
        .status(geminiRes.status)
        .json({ error: "Gemini API Error", detail: errorText });
      return;
    }

    const data = await geminiRes.json();
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "Server Internal Error", detail: message });
  }
});

export default router;
