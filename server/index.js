require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");
const { YoutubeTranscript } = require("youtube-transcript");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/dist")));

// ── YouTube: fetch description + title via Data API ───────────────────────
async function getVideoDescription(videoId) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${key}`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    const snippet = data.items?.[0]?.snippet;
    if (!snippet) return null;
    return {
      title: snippet.title,
      description: snippet.description,
      channelTitle: snippet.channelTitle,
    };
  } catch {
    return null;
  }
}

// ── YouTube: fetch transcript/captions ───────────────────────────────────
async function getTranscript(videoId) {
  try {
    const lines = await YoutubeTranscript.fetchTranscript(videoId);
    return lines.map(l => l.text).join(" ");
  } catch {
    return null;
  }
}

// ── YouTube: oembed fallback for title when no API key ───────────────────
async function getOembed(videoId) {
  try {
    const resp = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return { title: data.title, channelTitle: data.author_name };
  } catch {
    return null;
  }
}

// ── Call Anthropic ────────────────────────────────────────────────────────
async function callClaude(system, userMessage, useWebSearch = false) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
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
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`Anthropic API error ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

// ── Extract JSON from Claude response ─────────────────────────────────────
function extractJSON(data) {
  for (const block of [...data.content].reverse()) {
    if (block.type === "text") {
      const text = block.text.trim();
      if (text.startsWith("{")) { try { return JSON.parse(text); } catch {} }
      const match = text.match(/\{[\s\S]*\}/);
      if (match) { try { return JSON.parse(match[0]); } catch {} }
    }
  }
  return null;
}

// ── POST /api/extract ─────────────────────────────────────────────────────
app.post("/api/extract", async (req, res) => {
  const { videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Gather all available sources in parallel
    const [meta, transcript] = await Promise.all([
      getVideoDescription(videoId).then(d => d || getOembed(videoId)),
      getTranscript(videoId),
    ]);

    const hasDescription = meta?.description && meta.description.length > 80;
    const hasTranscript = transcript && transcript.length > 100;
    const hasYouTubeAPI = !!process.env.YOUTUBE_API_KEY;

    // Build the richest possible context for Claude
    let contextBlocks = [];
    let sources = [];

    if (meta?.title) contextBlocks.push(`Video title: ${meta.title}`);
    if (meta?.channelTitle) contextBlocks.push(`Creator: ${meta.channelTitle}`);
    contextBlocks.push(`Video URL: ${videoUrl}`);

    if (hasDescription) {
      contextBlocks.push(`\nVideo description (written by the creator):\n"""\n${meta.description.slice(0, 3000)}\n"""`);
      sources.push("description");
    }

    if (hasTranscript) {
      contextBlocks.push(`\nVideo transcript (spoken audio):\n"""\n${transcript.slice(0, 3000)}\n"""`);
      sources.push("transcript");
    }

    // Decide whether to also use web search
    // Use it if we have neither description nor transcript, or as supplemental
    const useSearch = !hasDescription && !hasTranscript;

    const sourceLabel = sources.length > 0
      ? sources.join(" + ")
      : hasYouTubeAPI ? "web search (no description found)" : "web search (no API key)";

    const system = `You are a precise recipe extraction assistant. Extract recipes with exact measurements, temperatures, and techniques.

Return ONLY a valid JSON object, no markdown, no backticks:
{
  "name": "Recipe Name",
  "description": "1-2 sentence description of the finished dish",
  "servings": "4",
  "prepTime": 15,
  "cookTime": 30,
  "ingredients": ["1 cup all-purpose flour", "2 large eggs", "..."],
  "directions": ["Preheat oven to 375°F (190°C).", "In a large bowl, whisk together...", "..."],
  "searchQuery": "finished dish name food photography",
  "sourceLabel": "${sourceLabel}"
}

Rules:
- ingredients: always include quantity and unit (e.g. "2 tablespoons olive oil", not just "olive oil")
- directions: each step is a complete, precise sentence. Include temperatures, times, and visual cues.
- If you're unsure of a measurement, note it as "to taste" or give a typical range
- Do NOT invent steps or ingredients not present in the source material
- prepTime and cookTime are integers in minutes`;

    const userMessage = contextBlocks.join("\n") + "\n\nExtract the complete recipe. Return only the JSON.";

    const data = await callClaude(system, userMessage, useSearch);
    const recipe = extractJSON(data);

    if (!recipe) {
      return res.status(422).json({
        error: "Could not extract a recipe from this video. Try a video where the creator posts the recipe in the description."
      });
    }

    recipe.sourceLabel = sourceLabel;
    recipe.hasYouTubeAPI = hasYouTubeAPI;
    res.json(recipe);

  } catch (err) {
    console.error("Extract error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/photo ───────────────────────────────────────────────────────
app.post("/api/photo", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Missing query" });
  try {
    const data = await callClaude(
      `Find a recipe photo. Search and return ONLY JSON (no markdown): {"imageUrl": "https://...jpg"}. Direct image URL only. If not found: {"imageUrl": ""}`,
      `Find a beautiful food photo for: ${query}`,
      true
    );
    const result = extractJSON(data);
    res.json({ imageUrl: result?.imageUrl || "" });
  } catch {
    res.json({ imageUrl: "" });
  }
});

// ── Catch-all ─────────────────────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => console.log(`✅  YT-to-Paprika running on port ${PORT}`));
