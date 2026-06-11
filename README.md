# Squarespace Customizations

Custom code and assets for the Breathing Records Squarespace website.

## Structure (mirrors the Squarespace interface)

| Repo file | Squarespace spot | Purpose |
|-----------|------------------|---------|
| `css/site.css` | Design > Custom CSS | Site-wide custom CSS |
| `js/header.js` | Code Injection > Header | Scripts for the Header box |
| `js/footer.js` | Code Injection > Footer | Scripts for the Footer box |
| `injection/` | n/a | The loader snippets you paste once into each box |
| `assets/` | n/a | Images, fonts, other static files |
| `notes/` | n/a | Design notes and reference |

You edit the three files in the top rows. Each maps 1:1 to a Squarespace code spot.

## Hosting and environments (Netlify)

CSS/JS are served from Netlify, which auto-deploys this repo. Squarespace pulls them in
via two small loader snippets (one in the Header box, one in the Footer box), so GitHub
is the source of truth. You paste the loaders once; after that you only edit the files
above and push.

Two environments off one Netlify site:

| Env | Branch | URL | Who sees it |
|-----|--------|-----|-------------|
| Production | `main` | `https://breathing-records.netlify.app/...` | all visitors |
| Staging | `staging` | `https://staging--breathing-records.netlify.app/...` | only you, via `?brdev=1` |

The loaders serve production by default. Append `?brdev=1` to any page to load the
`staging` branch in your browser only (sticky + cache-busted); `?brdev=0` exits.
See `notes/dev-bookmarklet.md` for a one-click toggle.

### One-time setup
1. Netlify: app.netlify.com > Add new site > Import > pick
   `Breathing-Records/squarespace-customizations`. Build command empty; publish `.`
   (already in `netlify.toml`). Rename the site to `breathing-records`.
2. Enable the staging branch deploy: Site config > Build & deploy > Branches >
   add `staging` (or "Deploy all branches").
3. Paste `injection/header.html` into Squarespace > Settings > Advanced > Code
   Injection > Header box.
4. Paste `injection/footer.html` into the Footer box on the same screen. Done, once.

## Workflow (test on staging, promote to prod)

1. `git switch staging`, edit `css/site.css` / `js/header.js` / `js/footer.js`,
   commit, `git push`.
2. Test thoroughly on the real site at `breathingrecords.com/?brdev=1`.
3. When happy, promote: `git switch main && git merge staging && git push`.
4. Record what changed in `notes/changelog.md`.

Rollback: if a bad change reached `main`, `git revert <commit> && git push`, and
Netlify redeploys in ~30s.
