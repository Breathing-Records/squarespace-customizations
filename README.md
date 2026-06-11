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

## Workflow

1. Make changes here and commit.
2. Copy the updated snippet into the matching Squarespace panel.
3. Record what changed and where in `notes/changelog.md`.
