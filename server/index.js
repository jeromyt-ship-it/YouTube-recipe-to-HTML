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

// ── Fetch transcript from YouTube ─────────────────────────────────────────
async function getTranscript(videoId) {
  try {
    const lines = await YoutubeTranscript.fetchTranscript(videoId);
    // Join all caption lines into one block of text
    return lines.map(l => l.text).join(" ");
  } catch (e) {
    return null;
  }
}

// ── Fetch video title + description via oembed (no API key needed) ─────────
async function getVideoMeta(videoId) {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    return { title: data.title, author: data.author_name };
  } catch {
    return null;
  }
}

// ── Call Anthropic API ────────────────────────────────────────────────────
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
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Anthropic API error ${resp.status}: ${err}`);
  }
  return resp.json();
}

// ── Extract JSON from Claude response ─────────────────────────────────────
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

// ── POST /api/extract ──────────────────────────────────────────────────────
app.post("/api/extract", async (req, res) => {
  const { videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  try {
    // Fetch transcript and video meta in parallel
    const [transcript, meta] = await Promise.all([
      getTranscript(videoId),
      getVideoMeta(videoId),
    ]);

    const hasTranscript = transcript && transcript.length > 100;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    let userMessage;
    let useWebSearch = false;

    if (hasTranscript) {
      // Best case: we have the actual spoken content of the video
      userMessage = `Extract the recipe from this YouTube video.

Video title: ${meta?.title || "Unknown"}
Creator: ${meta?.author || "Unknown"}
Video URL: ${videoUrl}

Video transcript (what the creator says in the video):
"""
${transcript.slice(0, 4000)}
"""

Use the transcript as your primary source. Extract all ingredients with measurements and step-by-step directions exactly as described. Return only the JSON object.`;
    } else {
      // Fallback: no transcript, use web search
      useWebSearch = true;
      userMessage = `Extract the recipe from this YouTube video. No transcript was available, so search the web for the recipe.

Video title: ${meta?.title || "Unknown"}
Creator: ${meta?.author || "Unknown"}
Video URL: ${videoUrl}

Search for the recipe online — check the creator's website, blog, or social media. Return only the JSON object.`;
    }

    const system = `You are a recipe extraction assistant. Extract recipe details and return ONLY a valid JSON object with no markdown, no backticks, no extra text:
{
  "name": "Recipe Name",
  "description": "Brief 1-2 sentence description of the dish",
  "servings": "4",
  "prepTime": 15,
  "cookTime": 30,
  "ingredients": ["1 cup flour", "2 large eggs", "..."],
  "directions": ["Preheat oven to 375°F.", "Mix the flour and eggs.", "..."],
  "searchQuery": "recipe name finished dish food photography",
  "transcriptUsed": true
}

prepTime and cookTime are integers in minutes (0 if unknown).
transcriptUsed should be true if you had a transcript, false if you used web search.
searchQuery should produce a beautiful food photo of the finished dish.
Be precise with measurements, temperatures, and cooking methods — exactly as stated in the source.`;

    const data = await callClaude(system, userMessage, useWebSearch);
    const recipe = extractJSON(data);

    if (!recipe) {
      return res.status(422).json({ error: "Could not parse a recipe from this video. The video may not have captions and the recipe may not be posted online." });
    }

    // Tell the frontend whether we used transcript or search
    recipe.transcriptUsed = hasTranscript;
    res.json(recipe);

  } catch (err) {
    console.error("Extract error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/photo ────────────────────────────────────────────────────────
app.post("/api/photo", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const data = await callClaude(
      `You find recipe photos. Search for a beautiful food photo and return ONLY a JSON object (no markdown):
{"imageUrl": "https://example.com/photo.jpg"}
Find a direct image URL (.jpg, .jpeg, .png, .webp). If you cannot find one, return {"imageUrl": ""}.`,
      `Find a beautiful food photo for: ${query}`,
      true
    );

    const result = extractJSON(data);
    res.json({ imageUrl: result?.imageUrl || "" });
  } catch (err) {
    console.error("Photo error:", err.message);
    res.json({ imageUrl: "" });
  }
});

// ── Catch-all → React app ──────────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅  YT-to-Paprika running on port ${PORT}`);
});
