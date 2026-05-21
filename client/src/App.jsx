import { useState } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#0F0D0B",
  card: "#1A1714",
  border: "#2E2A26",
  accent: "#E8572A",
  text: "#F5F0EB",
  muted: "#8A8078",
};

// ── Global styles ─────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${C.bg};
    color: ${C.text};
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 24px 80px;
    position: relative;
    overflow: hidden;
  }

  .bg-glow {
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,87,42,0.12) 0%, transparent 60%),
      repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 41px),
      repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 41px);
    pointer-events: none;
    z-index: 0;
  }

  .content {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 680px;
  }

  /* Header */
  .header { text-align: center; margin-bottom: 56px; }

  .logo-mark {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
  }
  .logo-icon {
    width: 36px; height: 36px;
    background: ${C.accent};
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .logo-label {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: ${C.muted};
  }

  h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 6vw, 52px);
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 16px;
    background: linear-gradient(135deg, ${C.text} 60%, rgba(245,240,235,0.45));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .subtitle {
    color: ${C.muted};
    font-size: 15px;
    font-weight: 300;
    line-height: 1.65;
  }

  /* Input card */
  .input-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 24px;
  }
  .input-label {
    display: block;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${C.muted};
    margin-bottom: 12px;
  }
  .url-row { display: flex; gap: 12px; }

  .url-input {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1px solid ${C.border};
    border-radius: 10px;
    padding: 14px 18px;
    color: ${C.text};
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    min-width: 0;
  }
  .url-input::placeholder { color: ${C.muted}; }
  .url-input:focus {
    border-color: ${C.accent};
    box-shadow: 0 0 0 3px rgba(232,87,42,0.15);
  }

  .btn {
    background: ${C.accent};
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 14px 22px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .btn:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .btn:active:not(:disabled) { transform: translateY(0); }
  .btn:disabled { opacity: 0.38; cursor: not-allowed; }

  .hint {
    margin-top: 14px;
    font-size: 12px;
    color: ${C.muted};
    line-height: 1.55;
  }
  .hint code {
    font-family: 'DM Mono', monospace;
    color: rgba(232,87,42,0.85);
    background: rgba(232,87,42,0.09);
    padding: 1px 5px;
    border-radius: 4px;
  }

  /* Status */
  .status-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 40px 32px;
    text-align: center;
    margin-bottom: 24px;
  }
  .spinner {
    width: 40px; height: 40px;
    border: 3px solid rgba(232,87,42,0.2);
    border-top-color: ${C.accent};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 20px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .status-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${C.muted};
    margin-bottom: 8px;
  }
  .status-msg { font-size: 15px; color: ${C.text}; }

  /* Result card */
  .result-card {
    background: ${C.card};
    border: 1px solid rgba(232,87,42,0.3);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 24px;
  }
  .result-header {
    padding: 24px 28px;
    border-bottom: 1px solid ${C.border};
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  .recipe-thumb {
    width: 72px; height: 72px;
    border-radius: 10px;
    object-fit: cover;
    flex-shrink: 0;
    background: ${C.border};
  }
  .thumb-placeholder {
    width: 72px; height: 72px;
    border-radius: 10px;
    background: ${C.border};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    flex-shrink: 0;
  }
  .recipe-meta { flex: 1; min-width: 0; }
  .recipe-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 4px;
  }
  .recipe-times { font-size: 13px; color: ${C.muted}; margin-top: 4px; }
  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 10px;
  }
  .tag {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${C.accent};
    background: rgba(232,87,42,0.1);
    border: 1px solid rgba(232,87,42,0.2);
    padding: 3px 8px;
    border-radius: 4px;
  }

  /* Paprika guide */
  .paprika-guide {
    background: rgba(232,87,42,0.06);
    border: 1px solid rgba(232,87,42,0.18);
    border-radius: 12px;
    padding: 20px 24px;
    margin: 0 28px 24px;
  }
  .paprika-guide-title {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${C.accent};
    margin-bottom: 14px;
  }
  .paprika-steps { list-style: none; counter-reset: steps; }
  .paprika-steps li {
    counter-increment: steps;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 10px;
    font-size: 13px;
    color: rgba(245,240,235,0.82);
    line-height: 1.55;
  }
  .paprika-steps li::before {
    content: counter(steps);
    background: ${C.accent};
    color: #fff;
    min-width: 20px; height: 20px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    font-weight: 500;
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* Actions */
  .actions {
    padding: 20px 28px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .btn-secondary {
    background: rgba(255,255,255,0.06);
    color: ${C.text};
    border: 1px solid ${C.border};
    border-radius: 10px;
    padding: 12px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.1); }

  /* Error */
  .error-card {
    background: rgba(220,38,38,0.08);
    border: 1px solid rgba(220,38,38,0.25);
    border-radius: 16px;
    padding: 24px 28px;
    color: #FCA5A5;
    font-size: 14px;
    line-height: 1.55;
    margin-bottom: 24px;
  }

  .footer {
    margin-top: 32px;
    text-align: center;
    font-size: 11px;
    color: ${C.muted};
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.05em;
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────
function extractVideoId(url) {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function fmtTime(mins) {
  if (!mins) return "";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

function isoTime(mins) {
  if (!mins) return "";
  if (mins < 60) return `PT${mins}M`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `PT${h}H${m}M` : `PT${h}H`;
}

function buildPaprikaHTML(recipe, imageUrl) {
  const { name, description, servings, prepTime, cookTime, ingredients, directions, source } = recipe;
  const total = (prepTime || 0) + (cookTime || 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
</head>
<body>
  <div itemscope itemtype="https://schema.org/Recipe">
    <h1 itemprop="name">${name}</h1>

    ${imageUrl ? `<img itemprop="image" src="${imageUrl}" alt="${name}" style="max-width:600px;width:100%;border-radius:8px;">` : ""}

    <p itemprop="description">${description || ""}</p>

    ${source ? `<p>Source: <a itemprop="url" href="${source}">${source}</a></p>` : ""}

    <div>
      ${prepTime ? `<span itemprop="prepTime" content="${isoTime(prepTime)}">Prep: ${fmtTime(prepTime)}</span>` : ""}
      ${cookTime ? `<span itemprop="cookTime" content="${isoTime(cookTime)}"> &nbsp;|&nbsp; Cook: ${fmtTime(cookTime)}</span>` : ""}
      ${total ? `<span itemprop="totalTime" content="${isoTime(total)}"> &nbsp;|&nbsp; Total: ${fmtTime(total)}</span>` : ""}
      ${servings ? `<span itemprop="recipeYield"> &nbsp;|&nbsp; Serves: ${servings}</span>` : ""}
    </div>

    <h2>Ingredients</h2>
    <ul>
      ${(ingredients || []).map(i => `<li itemprop="recipeIngredient">${i}</li>`).join("\n      ")}
    </ul>

    <h2>Directions</h2>
    <ol>
      ${(directions || []).map(d =>
        `<li itemprop="recipeInstructions" itemscope itemtype="https://schema.org/HowToStep">
        <span itemprop="text">${d}</span>
      </li>`).join("\n      ")}
    </ol>
  </div>
</body>
</html>`;
}

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | loading | done | error
  const [statusMsg, setStatusMsg] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [paprikaHTML, setPaprikaHTML] = useState("");
  const [error, setError] = useState("");

  async function handleConvert() {
    const trimmed = url.trim();
    if (!trimmed) return;

    const videoId = extractVideoId(trimmed);
    if (!videoId) {
      setPhase("error");
      setError("Couldn't find a YouTube video ID in that URL. Paste a Shorts or regular YouTube link.");
      return;
    }

    setPhase("loading");
    setError("");
    setRecipe(null);
    setImageUrl("");

    try {
      // Step 1 — extract recipe
      setStatusMsg("Watching the video and extracting the recipe…");
      const extractResp = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const extractData = await extractResp.json();
      if (!extractResp.ok) throw new Error(extractData.error || "Recipe extraction failed.");

      // Step 2 — find photo
      setStatusMsg("Hunting down a great photo of the dish…");
      const photoResp = await fetch("/api/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: extractData.searchQuery || extractData.name }),
      });
      const photoData = await photoResp.json();
      const photo = photoData.imageUrl || "";

      // Step 3 — build HTML
      const html = buildPaprikaHTML(
        { ...extractData, source: `https://www.youtube.com/watch?v=${videoId}` },
        photo
      );

      setRecipe(extractData);
      setImageUrl(photo);
      setPaprikaHTML(html);
      setPhase("done");

    } catch (err) {
      setPhase("error");
      setError(err.message || "Something went wrong. Try again.");
    }
  }

  function openForPaprika() {
    const blob = new Blob([paprikaHTML], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  }

  function downloadHTML() {
    const blob = new Blob([paprikaHTML], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(recipe?.name || "recipe").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.html`;
    a.click();
  }

  function reset() {
    setPhase("idle");
    setUrl("");
    setRecipe(null);
    setImageUrl("");
    setError("");
  }

  const timeParts = recipe
    ? [
        recipe.servings && `Serves ${recipe.servings}`,
        recipe.prepTime && `${recipe.prepTime}m prep`,
        recipe.cookTime && `${recipe.cookTime}m cook`,
      ].filter(Boolean).join(" · ")
    : "";

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="bg-glow" />
        <div className="content">

          {/* Header */}
          <div className="header">
            <div className="logo-mark">
              <div className="logo-icon">🎬</div>
              <span className="logo-label">Shorts → Paprika</span>
            </div>
            <h1>Recipe Clipper</h1>
            <p className="subtitle">
              Paste any YouTube Shorts recipe link.<br />
              Get a Paprika-ready page with ingredients, steps, and a photo.
            </p>
          </div>

          {/* Input */}
          <div className="input-card">
            <label className="input-label">YouTube URL</label>
            <div className="url-row">
              <input
                className="url-input"
                type="text"
                placeholder="https://youtube.com/shorts/…"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleConvert()}
                disabled={phase === "loading"}
              />
              <button
                className="btn"
                onClick={handleConvert}
                disabled={phase === "loading" || !url.trim()}
              >
                {phase === "loading" ? "⏳" : "→"} Convert
              </button>
            </div>
            <p className="hint">
              Supports <code>youtube.com/shorts/…</code>, <code>youtu.be/…</code>, and regular watch links.
            </p>
          </div>

          {/* Loading */}
          {phase === "loading" && (
            <div className="status-card">
              <div className="spinner" />
              <p className="status-label">Working</p>
              <p className="status-msg">{statusMsg}</p>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="error-card">
              ⚠️ {error}
              <div style={{ marginTop: 14 }}>
                <button className="btn-secondary" onClick={reset}>← Try another URL</button>
              </div>
            </div>
          )}

          {/* Result */}
          {phase === "done" && recipe && (
            <div className="result-card">
              <div className="result-header">
                {imageUrl
                  ? <img className="recipe-thumb" src={imageUrl} alt={recipe.name} onError={e => e.target.style.display = "none"} />
                  : <div className="thumb-placeholder">🍽️</div>
                }
                <div className="recipe-meta">
                  <div className="recipe-name">{recipe.name}</div>
                  {timeParts && <div className="recipe-times">{timeParts}</div>}
                  <div className="tags">
                    <span className="tag">{(recipe.ingredients || []).length} ingredients</span>
                    <span className="tag">{(recipe.directions || []).length} steps</span>
                    {imageUrl && <span className="tag">📸 photo</span>}
                  </div>
                </div>
              </div>

              <div className="paprika-guide">
                <p className="paprika-guide-title">📱 How to clip into Paprika</p>
                <ol className="paprika-steps">
                  <li>Click <strong>"Open for Paprika"</strong> — a formatted recipe page opens in a new tab.</li>
                  <li>In that tab, activate your <strong>Paprika browser bookmarklet</strong> or extension.</li>
                  <li>Paprika reads the Schema.org markup and fills everything in automatically.</li>
                  <li>Review, save, and cook! 🎉</li>
                </ol>
              </div>

              <div className="actions">
                <button className="btn" onClick={openForPaprika}>📋 Open for Paprika</button>
                <button className="btn-secondary" onClick={downloadHTML}>↓ Download HTML</button>
                <button className="btn-secondary" onClick={reset}>↺ New Recipe</button>
              </div>
            </div>
          )}

          <div className="footer">
            powered by claude sonnet · schema.org/Recipe · paprika compatible
          </div>
        </div>
      </div>
    </>
  );
}
