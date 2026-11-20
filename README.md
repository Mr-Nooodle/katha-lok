# Katha Lok website

A streaming-style site (Netflix/Hotstar layout) for the YouTube channel [@Hindi-Kathalok](https://www.youtube.com/@Hindi-Kathalok).

**Look: "Ink & Sindoor" (v2, 2026-11-20).** Warm ink-black (dark) or manuscript paper (light), one vermilion accent, Fraunces / Tiro Devanagari Hindi headings, Inter / Mukta text, light film grain. The keyhole mark is kept, drawn in the accent colour. This is the website's own palette; the YouTube channel brand (midnight + gold) is unchanged.

**What it does**
- **English first, with a हिंदी toggle** (EN | हिं in the header). The interface, dates and series names switch, and video titles show the matching language's part of the YouTube title. Better English titles can be set per video in `config.js → titles`.
- **Light and dark mode** (follows the device the first time, then remembers the choice, with no flash on load).
- **Channel trailer banner:** the first home slide plays a silent 5.6 s clip of the promo (corridor to the keyhole door) with "Watch trailer" and "Start Mahabharat · Ep 1". Then the newest episodes rotate, with a thumbnail picker and progress bar (pauses on hover, swipe on phones).
- **Watch page** (`#/watch/<id>`): the player sits in the page and scrolls with it, with clickable chapters, the series' episode list beside it, Next episode, an "Up next" countdown at the end, and resume where you left off.
- **Shorts feed** (`#/shorts/<id>`): full-screen vertical feed; swipe, scroll or press ↑ ↓, and only the visible Short plays.
- **Search** (press `/`): instant results with thumbnails, keyboard navigation, recent searches and suggestions.
- Continue watching (minutes left, remove with undo), My List (undo), "New" badges plus a "N new since your last visit" note, watched/remaining status on series pages, skeleton loading, a phone tab bar and a header that tucks away on scroll.
- **Engagement panel** under every video: like and comment counts, a "Your take" question (`config.js → questions`, drafts to review), top YouTube comments (needs the API key), and buttons that open YouTube to like, comment and subscribe.
- **Share sheet:** WhatsApp first, copy link, other apps, and "Start at 12:34" so links open at that moment (`#/watch/<id>?t=754`).
- **Theater mode and keyboard shortcuts** on the watch page: K, J/L, M, F, T, N.
- **Weekly release calendar** on the home page (`config.js → schedule`), with the next release highlighted and a Subscribe + bell button.
- **Shorts → full episode:** each Short in the feed links to the episode that tells its story in full, when one exists.
- **Series progress** ("1 of 3 watched") on series pages and tiles.
- **Installable app:** a manifest and service worker, so phones offer "Add to Home screen" / "Install", and the last-seen catalogue still opens offline.
- **It updates itself:** a scheduled GitHub Action reads the channel every 2 hours and republishes the site, so new uploads appear without anyone touching it.

No build step or npm packages: plain HTML/CSS/JS.

## Files
| Path | What |
|---|---|
| `index.html` | page shell |
| `config.js` | **the file to edit**: channel, series rules (name + title match), hero exclusions, optional live API key |
| `assets/app.js` | the app (routing, rows, player, progress, search) |
| `assets/yt-api.js` | YouTube Data API reader, shared by the page and the sync script |
| `assets/style.css` | Ink & Sindoor styles, light + dark |
| `assets/promo/` | silent trailer clip (1280 and 640 px) and poster frames, cut from `episodes/channel-promo/production/final-v01` |
| `data/videos.json` | the video list the page reads (generated) |
| `scripts/sync-videos.mjs` | rebuilds `data/videos.json` |
| `.github/workflows/deploy.yml` | every 2 h: sync, then publish to GitHub Pages |

## Hosting (free): GitHub Pages
Wix and similar site builders don't host a custom app like this. They only let you embed it in a frame. GitHub Pages is free, gives you `https://<username>.github.io/<repo>/`, accepts a custom domain, and runs the 2-hourly auto-update for free.

1. Create a free account at github.com, then **New repository**, for example `katha-lok`, set to **Public**.
2. **Add file → Upload files**: drag in everything inside this `website` folder (not the folder itself). If the hidden `.github` folder doesn't upload, use **Add file → Create new file**, type the name `.github/workflows/deploy.yml` and paste in the file's contents.
3. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. **Actions** tab → "Sync videos and deploy" → **Run workflow**. After about a minute the site is live at the URL shown on the run.
5. (Recommended) Add a YouTube API key so the site gets the *full* catalogue, playlists and exact durations. Without a key it uses the public feed, which lists only the newest 15 uploads, but it keeps everything it has seen before, so the list still grows over time.
   - console.cloud.google.com → new project → **APIs & Services → Library → "YouTube Data API v3" → Enable**.
   - **Credentials → Create credentials → API key** → *API restrictions*: YouTube Data API v3 only. It is free (each sync uses about 20 of the 10,000 daily units).
   - In GitHub: **Settings → Secrets and variables → Actions → New repository secret**, name `YT_API_KEY`, paste the key. Run the workflow again.

Other free hosts work too, for example **Cloudflare Pages** or **Netlify** (connect the same GitHub repo). Netlify Drop (drag-and-drop) also works, but then the list only updates when you re-upload, unless you use live mode below.

### Custom domain (optional)
Buy a domain (for example `kathalok.in`) and add it under **Settings → Pages → Custom domain**. Then put its full address in `index.html`'s `og:image` (`https://kathalok.in/assets/og-banner.png`) so WhatsApp and other link previews show the banner.

### Live mode (optional, for hosts without GitHub Actions)
Put an API key in `config.js` → `apiKey`. Visitors' browsers then read YouTube directly (cached 30 min). The key is visible in the page, so in Google Cloud restrict it to **Websites: your domain** and to **YouTube Data API v3** only.

## Views and engagement
- **Views:** a play on this site happens in YouTube's own player, so YouTube records the view and the watch time. In YouTube Studio it shows under traffic source "External" (the embedding site). The silent clip on the home banner is a local file, not YouTube, so it never adds fake views.
- **Likes, comments, subscriptions:** YouTube doesn't let a website like or comment on a viewer's behalf without a Google sign-in on the site plus Google's app review for that permission. So the site shows the numbers and top comments and sends people to YouTube for those actions (Subscribe links open YouTube's subscribe confirmation).

## Day-to-day
- New uploads appear by themselves within 2 hours (or run the workflow by hand).
- New series: add a line to `series` in `config.js` (`match` is a regular expression on the title). A YouTube playlist with the same name is merged in automatically, and any other playlist with 2+ videos becomes its own row.
- Episode order comes from `Ep 01`, `Ep 02`… in the title, so keep that pattern.
- Shorts are detected from the `/shorts/` link or `#shorts`.

## Local preview
```bash
python -m http.server 8765 --directory website
```
Then open http://localhost:8765. To refresh the list locally: `node scripts/sync-videos.mjs` (set `YT_API_KEY` first for the full catalogue).
