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

## Hosting & environments (Netlify)

CSS/JS are served from Netlify, which auto-deploys this repo. Squarespace loads them
via a small loader snippet (`injection/header.html`, pasted once into Code Injection →
Header), so **GitHub is the source of truth**.

Two environments off one Netlify site:

| Env | Branch | URL | Who sees it |
|-----|--------|-----|-------------|
| **Production** | `main` | `https://breathing-records.netlify.app/...` | all visitors |
| **Staging** | `staging` | `https://staging--breathing-records.netlify.app/...` | only you, via `?brdev=1` |

The loader serves production by default. Append `?brdev=1` to any page to load the
`staging` branch in your browser only (sticky + cache-busted); `?brdev=0` exits.

### One-time setup
1. **Netlify:** app.netlify.com → Add new site → Import → pick
   `Breathing-Records/squarespace-customizations`. Build command empty; publish `.`
   (already in `netlify.toml`). Rename the site to something stable.
2. **Enable the staging branch deploy:** Site config → Build & deploy → Branches →
   add `staging` (or "Deploy all branches").
3. Paste `injection/header.html` (already filled in with `breathing-records`) into
   Squarespace → Settings → Advanced → Code Injection → **Header**. Done — once.

## Workflow (test on staging, promote to prod)

1. `git switch staging`, edit `css/site.css` / `js/main.js`, commit, `git push`.
2. Test thoroughly on the real site at `breathingrecords.com/?brdev=1`.
3. When happy, promote: `git switch main && git merge staging && git push`.
4. Record what changed in `notes/changelog.md`.

Rollback: if a bad change reached `main`, `git revert <commit> && git push` —
Netlify redeploys in ~30s.
