import { useState } from "react";

// ── Design tokens — matches Cookbook to Paprika ───────────────────────────
const C = {
  bg: "#F0EDE8",          // warm off-white
  card: "#FFFFFF",
  border: "#D8D3CC",
  borderDashed: "#C8C3BC",
  green: "#3A9D6E",
  greenDark: "#2E7D57",
  greenLight: "#EAF5EF",
  text: "#1A1A1A",
  textMuted: "#888880",
  textLight: "#AAAAAA",
  red: "#D94F4F",
  redLight: "#FDF0F0",
  yellow: "#B07D2A",
  yellowLight: "#FDF6E8",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${C.bg};
    color: ${C.text};
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 56px 20px 80px;
  }

  .content {
    width: 100%;
    max-width: 640px;
  }

  /* ── Header ── */
  .header {
    text-align: center;
    margin-bottom: 40px;
  }

  h1 {
    font-family: 'Lora', serif;
    font-size: clamp(32px, 6vw, 48px);
    font-weight: 400;
    color: ${C.text};
    line-height: 1.15;
    margin-bottom: 10px;
  }

  .subtitle {
    font-size: 15px;
    color: ${C.textMuted};
    font-weight: 400;
    letter-spacing: 0.01em;
  }

  /* ── Card ── */
  .card {
    background: ${C.card};
    border-radius: 20px;
    padding: 28px;
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04);
  }

  /* ── Section label ── */
  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${C.textMuted};
    margin-bottom: 14px;
  }

  /* ── URL input area ── */
  .url-drop-zone {
    border: 2px dashed ${C.borderDashed};
    border-radius: 14px;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    transition: border-color 0.2s, background 0.2s;
    background: ${C.bg};
  }

  .url-drop-zone:focus-within {
    border-color: ${C.green};
    background: ${C.greenLight};
  }

  .url-icon {
    width: 48px;
    height: 48px;
    background: ${C.greenLight};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .url-input {
    width: 100%;
    background: ${C.card};
    border: 1.5px solid ${C.border};
    border-radius: 10px;
    padding: 12px 16px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: ${C.text};
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    text-align: center;
  }

  .url-input::placeholder { color: ${C.textLight}; }

  .url-input:focus {
    border-color: ${C.green};
    box-shadow: 0 0 0 3px rgba(58,157,110,0.12);
  }

  .url-hint {
    font-size: 12px;
    color: ${C.textMuted};
    text-align: center;
    line-height: 1.5;
  }

  /* ── Primary button ── */
  .btn-primary {
    width: 100%;
    background: ${C.green};
    color: white;
    border: none;
    border-radius: 14px;
    padding: 18px 24px;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s, transform 0.12s;
    letter-spacing: 0.01em;
  }

  .btn-primary:hover:not(:disabled) { background: ${C.greenDark}; }
  .btn-primary:active:not(:disabled) { transform: scale(0.99); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-sub {
    font-size: 12px;
    color: ${C.textMuted};
    text-align: center;
    margin-top: 10px;
  }

  /* ── Source badge ── */
  .source-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 20px;
  }

  .badge-green {
    background: ${C.greenLight};
    color: ${C.green};
    border: 1px solid rgba(58,157,110,0.2);
  }

  .badge-yellow {
    background: ${C.yellowLight};
    color: ${C.yellow};
    border: 1px solid rgba(176,125,42,0.2);
  }

  .badge-gray {
    background: #F0F0EE;
    color: ${C.textMuted};
    border: 1px solid ${C.border};
  }

  /* ── Loading ── */
  .loading-card {
    text-align: center;
    padding: 48px 28px;
  }

  .spinner {
    width: 44px;
    height: 44px;
    border: 3px solid rgba(58,157,110,0.15);
    border-top-color: ${C.green};
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .loading-title {
    font-family: 'Lora', serif;
    font-size: 18px;
    color: ${C.text};
    margin-bottom: 6px;
  }

  .loading-msg {
    font-size: 14px;
    color: ${C.textMuted};
  }

  /* ── Result ── */
  .result-header {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid ${C.border};
  }

  .dish-thumb {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    object-fit: cover;
    flex-shrink: 0;
    background: ${C.bg};
  }

  .thumb-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    background: ${C.bg};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    flex-shrink: 0;
  }

  .recipe-title {
    font-family: 'Lora', serif;
    font-size: 22px;
    font-weight: 600;
    line-height: 1.25;
    margin-bottom: 5px;
    color: ${C.text};
  }

  .recipe-times {
    font-size: 13px;
    color: ${C.textMuted};
    margin-bottom: 2px;
  }

  /* ── Paprika guide ── */
  .paprika-guide {
    background: ${C.greenLight};
    border: 1px solid rgba(58,157,110,0.2);
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 16px;
  }

  .paprika-guide-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${C.green};
    margin-bottom: 12px;
  }

  .steps-list {
    list-style: none;
    counter-reset: steps;
  }

  .steps-list li {
    counter-increment: steps;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 8px;
    font-size: 13px;
    color: #2A5A40;
    line-height: 1.5;
  }

  .steps-list li::before {
    content: counter(steps);
    background: ${C.green};
    color: white;
    min-width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ── Action buttons ── */
  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .btn-action {
    flex: 1;
    min-width: 140px;
    background: ${C.green};
    color: white;
    border: none;
    border-radius: 12px;
    padding: 14px 18px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s;
    text-align: center;
  }
  .btn-action:hover { background: ${C.greenDark}; }

  .btn-outline {
    flex: 1;
    min-width: 120px;
    background: transparent;
    color: ${C.textMuted};
    border: 1.5px solid ${C.border};
    border-radius: 12px;
    padding: 14px 18px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.18s, color 0.18s;
    text-align: center;
  }
  .btn-outline:hover { border-color: ${C.textMuted}; color: ${C.text}; }

  /* ── Error ── */
  .error-card {
    background: ${C.redLight};
    border: 1px solid rgba(217,79,79,0.2);
    border-radius: 14px;
    padding: 20px 24px;
    color: ${C.red};
    font-size: 14px;
    line-height: 1.55;
    margin-bottom: 16px;
  }

  .error-card .btn-outline {
    margin-top: 14px;
    color: ${C.red};
    border-color: rgba(217,79,79,0.3);
    flex: none;
    width: auto;
  }

  /* ── No API key notice ── */
  .notice {
    background: ${C.yellowLight};
    border: 1px solid rgba(176,125,42,0.2);
    border-radius: 12px;
    padding: 14px 18px;
    font-size: 13px;
    color: ${C.yellow};
    line-height: 1.55;
    margin-bottom: 16px;
  }

  /* ── Footer ── */
  .footer {
    margin-top: 36px;
    text-align: center;
    font-size: 12px;
    color: ${C.textLight};
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
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

function isoTime(mins) {
  if (!mins) return "";
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `PT${h}H${m}M` : (h ? `PT${h}H` : `PT${mins}M`);
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
      ${cookTime ? `<span itemprop="cookTime" content="${isoTime(cookTime)}"> | Cook: ${fmtTime(cookTime)}</span>` : ""}
      ${total ? `<span itemprop="totalTime" content="${isoTime(total)}"> | Total: ${fmtTime(total)}</span>` : ""}
      ${servings ? `<span itemprop="recipeYield"> | Serves: ${servings}</span>` : ""}
    </div>
    <h2>Ingredients</h2>
    <ul>
      ${(ingredients || []).map(i => `<li itemprop="recipeIngredient">${i}</li>`).join("\n      ")}
    </ul>
    <h2>Directions</h2>
    <ol>
      ${(directions || []).map(d =>
        `<li itemprop="recipeInstructions" itemscope itemtype="https://schema.org/HowToStep"><span itemprop="text">${d}</span></li>`
      ).join("\n      ")}
    </ol>
  </div>
</body>
</html>`;
}

// ── Source badge helper ───────────────────────────────────────────────────
function SourceBadges({ recipe }) {
  if (!recipe) return null;
  const label = recipe.sourceLabel || "";
  const hasDescription = label.includes("description");
  const hasTranscript = label.includes("transcript");
  const hasSearch = label.includes("search");

  return (
    <div className="source-row">
      {hasDescription && <span className="badge badge-green">✓ Video description</span>}
      {hasTranscript && <span className="badge badge-green">✓ Transcript</span>}
      {hasSearch && !hasDescription && !hasTranscript && (
        <span className="badge badge-yellow">⚠ Web search only</span>
      )}
      {!recipe.hasYouTubeAPI && (
        <span className="badge badge-gray">No YouTube API key</span>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState("idle");
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
    setStatusMsg("Gathering recipe from the video…");

    try {
      const extractResp = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const extractData = await extractResp.json();
      if (!extractResp.ok) throw new Error(extractData.error || "Recipe extraction failed.");

      setStatusMsg("Finding a photo of the dish…");
      const photoResp = await fetch("/api/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: extractData.searchQuery || extractData.name }),
      });
      const photoData = await photoResp.json();
      const photo = photoData.imageUrl || "";

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
        recipe.prepTime && `${recipe.prepTime} min prep`,
        recipe.cookTime && `${recipe.cookTime} min cook`,
      ].filter(Boolean).join("  ·  ")
    : "";

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="content">

          <div className="header">
            <h1>YouTube to Paprika</h1>
            <p className="subtitle">Paste a recipe Short · extract · clip to Paprika</p>
          </div>

          {/* Input card — always visible */}
          {phase === "idle" || phase === "error" ? (
            <>
              {phase === "error" && (
                <div className="error-card">
                  ⚠️ {error}
                  <div><button className="btn-outline" onClick={reset}>← Try again</button></div>
                </div>
              )}

              <div className="card">
                <p className="section-label">YouTube URL</p>
                <div className="url-drop-zone">
                  <div className="url-icon">▶️</div>
                  <input
                    className="url-input"
                    type="text"
                    placeholder="https://youtube.com/shorts/…"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleConvert()}
                  />
                  <p className="url-hint">
                    Supports Shorts, regular watch links, and youtu.be links
                  </p>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleConvert}
                disabled={!url.trim()}
              >
                Extract recipe
              </button>
              <p className="btn-sub">Powered by Claude AI · ~15–30 seconds</p>
            </>
          ) : null}

          {/* Loading */}
          {phase === "loading" && (
            <div className="card loading-card">
              <div className="spinner" />
              <p className="loading-title">Extracting recipe…</p>
              <p className="loading-msg">{statusMsg}</p>
            </div>
          )}

          {/* Result */}
          {phase === "done" && recipe && (
            <>
              <div className="card">
                <div className="result-header">
                  {imageUrl
                    ? <img className="dish-thumb" src={imageUrl} alt={recipe.name} onError={e => e.target.style.display = "none"} />
                    : <div className="thumb-placeholder">🍽️</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="recipe-title">{recipe.name}</div>
                    {timeParts && <div className="recipe-times">{timeParts}</div>}
                    <SourceBadges recipe={recipe} />
                  </div>
                </div>

                <div className="paprika-guide">
                  <p className="paprika-guide-title">📱 Clip to Paprika</p>
                  <ol className="steps-list">
                    <li>Click <strong>"Open for Paprika"</strong> — a recipe page opens in a new tab.</li>
                    <li>In that tab, use your <strong>Paprika browser bookmarklet</strong>.</li>
                    <li>Paprika reads the recipe data and fills everything in automatically.</li>
                    <li>Review and save. 🎉</li>
                  </ol>
                </div>

                <div className="actions">
                  <button className="btn-action" onClick={openForPaprika}>📋 Open for Paprika</button>
                  <button className="btn-outline" onClick={downloadHTML}>↓ Download HTML</button>
                  <button className="btn-outline" onClick={reset}>↺ New recipe</button>
                </div>
              </div>
            </>
          )}

          <div className="footer">
            Powered by Claude AI · Schema.org/Recipe · Paprika compatible
          </div>
        </div>
      </div>
    </>
  );
}
