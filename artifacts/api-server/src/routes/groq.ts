import { Router, type IRouter } from "express";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const ALLOWED_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.1-70b-versatile",
  "mixtral-8x7b-32768",
  "llama3-8b-8192",
  "llama3-70b-8192",
  "gemma2-9b-it",
  "llama-3.3-70b-versatile",
  "llama-3.3-70b-specdec",
  "llama-3.2-11b-vision-preview",
  "llama-3.2-90b-vision-preview",
];

const router: IRouter = Router();

router.post("/groq", async (req, res) => {
  try {
    const { messages, model, tools, tool_choice, key, stream } = req.body;

    let modelToUse = ALLOWED_MODELS.includes(model)
      ? model
      : "llama-3.1-8b-instant";

    let apiKey = key as string | undefined;
    if (!apiKey) {
      const keysRaw = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY;
      if (keysRaw) {
        const keys = keysRaw.split(",").map((k) => k.trim()).filter(Boolean);
        if (keys.length > 0) {
          apiKey = keys[Math.floor(Math.random() * keys.length)];
        }
      }
    }

    if (!apiKey) {
      res.status(500).json({
        error: "Server Configuration Error: No valid GROQ keys found (ENV or Body).",
      });
      return;
    }

    const payload: Record<string, unknown> = {
      model: modelToUse,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      stream: !!stream,
    };
    if (tools) payload.tools = tools;
    if (tool_choice) payload.tool_choice = tool_choice;

    const groqRes = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      res.status(groqRes.status).json({ error: "Groq API Error", detail: errorText });
      return;
    }

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      if (groqRes.body) {
        const reader = groqRes.body.getReader();
        const pump = async () => {
          const { done, value } = await reader.read();
          if (done) { res.end(); return; }
          res.write(value);
          await pump();
        };
        await pump();
      } else {
        res.end();
      }
      return;
    }

    const data = await groqRes.json();
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "Server Internal Error", detail: message });
  }
});

export default router;
