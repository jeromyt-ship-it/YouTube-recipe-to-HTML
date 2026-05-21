# 🎬 YT → Paprika Recipe Clipper

Paste a YouTube Shorts recipe link. Get a clean, Paprika-ready HTML page with ingredients, directions, timing, and a dish photo — clippable directly from your browser.

---

## How it works

1. You paste a YouTube Shorts (or regular YT) URL
2. Claude searches the web to find the recipe from the video
3. Claude finds a photo of the finished dish
4. The app generates a Schema.org Recipe HTML page
5. You click "Open for Paprika" → use your Paprika browser bookmarklet → done ✅

---

## Local development

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/yt-to-paprika.git
cd yt-to-paprika

# 2. Install all dependencies
npm run install-all

# 3. Create your .env file
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 4. Run in dev mode (server + client with hot reload)
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## Deploy to Render

### One-time setup

1. Push this repo to GitHub
2. Log into [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Configure the service:

| Setting | Value |
|---|---|
| **Name** | `yt-to-paprika` (or whatever you like) |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

5. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` → your key from console.anthropic.com

6. Click **Create Web Service** — Render will build and deploy automatically.

### Subsequent deploys

Just push to your main branch on GitHub. Render auto-deploys on every push.

---

## Project structure

```
yt-to-paprika/
├── server/
│   └── index.js          # Express backend — holds API key, calls Anthropic
├── client/
│   ├── src/
│   │   ├── main.jsx      # React entry point
│   │   └── App.jsx       # Main UI component
│   ├── index.html
│   ├── vite.config.js    # Proxies /api → Express in dev
│   └── package.json
├── package.json          # Root — build + start scripts for Render
├── .env.example
└── .gitignore
```

---

## Tips

- Works best with Shorts from creators who post their recipes publicly (in descriptions, blogs, or indexed recipe sites)
- The "Open for Paprika" button creates an in-browser HTML page — use your Paprika bookmarklet on that tab
- You can also download the HTML and open it locally, then clip from there
