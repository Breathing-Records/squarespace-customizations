# Squarespace Customizations

Custom code and assets for the Breathing Records Squarespace website.

## Structure

| Path | Purpose |
|------|---------|
| `css/` | Custom CSS (site-wide and page-specific) |
| `js/` | Custom JavaScript snippets |
| `injection/` | Code Injection snippets, organized by where they go in Squarespace |
| `assets/` | Images, fonts, and other static files |
| `notes/` | Design notes, decisions, and Squarespace config reference |

## How customizations are applied in Squarespace

Squarespace customizations are typically added in one of these places:

- **Settings → Advanced → Code Injection** — site-wide `<head>` / `<footer>` code (see `injection/`)
- **Design → Custom CSS** — site-wide CSS (see `css/site.css`)
- **Page Settings → Advanced → Page Header Code Injection** — per-page code
- **Code Blocks** — inline HTML/CSS/JS on a specific page/section

Keep this repo as the source of truth, then copy the relevant snippet into the
corresponding Squarespace panel. Note in each file where it is meant to live.

## Hosting (Netlify CDN)

CSS/JS are served from Netlify, which deploys this repo automatically. Squarespace
loads them via `<link>`/`<script>` tags in Code Injection, so **GitHub is the source
of truth** — push a change and the live site picks it up (no re-pasting).

- Live CSS: `https://SITE-NAME.netlify.app/css/site.css`
- Live JS:  `https://SITE-NAME.netlify.app/js/main.js`
- Config: `netlify.toml`
- The `<link>` / `<script>` tags to paste once into Squarespace live in `injection/`.

### One-time Netlify setup
1. Go to https://app.netlify.com → **Add new site → Import an existing project**.
2. Connect GitHub → pick `Breathing-Records/squarespace-customizations`.
3. Build command: *(leave empty)*. Publish directory: `.` (already set in `netlify.toml`).
4. Deploy, then rename the site (Site settings → Change site name) to something stable.
5. Replace `SITE-NAME` in `injection/header.html` and `injection/footer.html` with that name.
6. Paste the two snippets into Squarespace Code Injection (Header + Footer). Done — once.

## Workflow

1. Edit `css/site.css` / `js/main.js` and `git push`.
2. Netlify redeploys automatically; the live site updates (hard-refresh to bust browser cache).
3. Record what changed in `notes/changelog.md`.
