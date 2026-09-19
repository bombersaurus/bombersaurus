export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const hubPin = process.env.HUB_AI_PIN;

  if (!apiKey) {
    return res.status(503).json({ error: "AI is not configured yet. Add OPENAI_API_KEY in Vercel." });
  }

  if (hubPin) {
    const supplied = String(req.headers["x-hub-key"] || "");
    if (!supplied || supplied !== hubPin) {
      return res.status(401).json({ error: "Hub AI PIN is incorrect." });
    }
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const message = String(body.message || "").trim();
  if (!message) return res.status(400).json({ error: "Message is required." });
  if (message.length > 16000) return res.status(400).json({ error: "Message is too long." });

  const model = process.env.OPENAI_MODEL || "gpt-5.6-sol";
  const effort = ["low","medium","high","xhigh","max"].includes(body.effort) ? body.effort : "high";
  const context = body.context && typeof body.context === "object" ? body.context : {};
  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];

  const system = [
    "You are the intelligence assistant inside Rabiul Work Hub.",
    "Support teaching, curriculum, assessment, learner support and admin work.",
    "Use the supplied Hub context as the source of truth. Do not invent learner facts or specification criteria.",
    "For lesson work, follow the saved Oldham College teaching style and use specification links where supplied.",
    "For marking, default to WWW / EBI / Overall / Indicative Grade and identify exact missing evidence.",
    "Keep wording natural, concise, professional and ready to use.",
    "When the user asks for a finished output, produce the finished output rather than generic advice."
  ].join("\n");

  const historyText = history.map(m => {
    const role = m && m.role === "assistant" ? "ASSISTANT" : "USER";
    return role + ": " + String(m?.content || "").slice(0,6000);
  }).join("\n\n");

  const input = [
    "HUB CONTEXT:",
    JSON.stringify(context).slice(0,70000),
    historyText ? "\nRECENT HUB CHAT:\n" + historyText : "",
    "\nCURRENT REQUEST:\n" + message
  ].join("\n");

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        reasoning: { effort },
        instructions: system,
        input,
        max_output_tokens: 8000
      })
    });

    const data = await r.json();
    if (!r.ok) {
      const msg = data?.error?.message || "OpenAI request failed.";
      return res.status(r.status).json({ error: msg });
    }

    let text = data.output_text || "";
    if (!text && Array.isArray(data.output)) {
      text = data.output.flatMap(item => Array.isArray(item.content) ? item.content : [])
        .filter(part => part && (part.type === "output_text" || typeof part.text === "string"))
        .map(part => part.text || "")
        .join("\n");
    }

    return res.status(200).json({
      text: text || "No text response was returned.",
      model,
      usage: data.usage || null,
      response_id: data.id || null
    });
  } catch (error) {
    return res.status(500).json({ error: "AI connection failed. Please try again." });
  }
}