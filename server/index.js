require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve built React frontend in production
app.use(express.static(path.join(__dirname, "../client/dist")));

// ── Helper: call Anthropic ──────────────────────────────────────────────────
async function callClaude(system, userMessage, useWebSearch = false) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system,
    messages: [{ role: "user", content: userMessage }],
  };
  if (useWebSearch) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "interleaved-thinking-2025-05-14",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Anthropic API error ${resp.status}: ${err}`);
  }
  return resp.json();
}

// ── Extract JSON from Claude response ──────────────────────────────────────
function extractJSON(data) {
  for (const block of [...data.content].reverse()) {
    if (block.type === "text") {
      const text = block.text.trim();
      if (text.startsWith("{")) {
        try { return JSON.parse(text); } catch {}
      }
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { return JSON.parse(match[0]); } catch {}
      }
    }
  }
  return null;
}

// ── POST /api/extract ───────────────────────────────────────────────────────
// Receives { videoId }, returns recipe JSON
app.post("/api/extract", async (req, res) => {
  const { videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  try {
    const data = await callClaude(
      `You are a recipe extraction assistant. When given a YouTube video URL, search the web to find the recipe from that video. Look for the recipe title, ingredients list, step-by-step directions, prep time, cook time, and serving size.

Respond ONLY with a valid JSON object (no markdown, no backticks, no extra text) in this exact structure:
{
  "name": "Recipe Name",
  "description": "Brief 1-2 sentence description of the dish",
  "servings": "4",
  "prepTime": 15,
  "cookTime": 30,
  "ingredients": ["1 cup flour", "2 eggs", "..."],
  "directions": ["Step one.", "Step two.", "..."],
  "searchQuery": "creamy tuscan chicken pasta dish food photo"
}

prepTime and cookTime are integers in minutes (use 0 if unknown).
searchQuery should be a good image search query to find a beautiful food photo of this dish.`,
      `Extract the recipe from this YouTube video: https://www.youtube.com/watch?v=${videoId}\n\nSearch for it on the web if needed. Return only the JSON object.`,
      true
    );

    const recipe = extractJSON(data);
    if (!recipe) return res.status(422).json({ error: "Could not parse recipe from this video. Try a different one." });

    res.json(recipe);
  } catch (err) {
    console.error("Extract error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/photo ─────────────────────────────────────────────────────────
// Receives { query }, returns { imageUrl }
app.post("/api/photo", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const data = await callClaude(
      `You are a helper that finds recipe photos. Search for a beautiful food photo of the dish described and return ONLY a JSON object (no markdown, no backticks) like:
{"imageUrl": "https://example.com/photo.jpg"}

Find a direct image URL (.jpg, .jpeg, .png, .webp). If you cannot find one, return {"imageUrl": ""}.`,
      `Find a beautiful food photo for: ${query}`,
      true
    );

    const result = extractJSON(data);
    res.json({ imageUrl: result?.imageUrl || "" });
  } catch (err) {
    console.error("Photo error:", err.message);
    res.json({ imageUrl: "" }); // non-fatal, just return empty
  }
});

// ── Catch-all → React app ───────────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅  YT-to-Paprika server running on port ${PORT}`);
});
