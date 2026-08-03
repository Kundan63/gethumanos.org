# HumanOS Website — Setup & Deploy Guide

Your Obsidian vault (178 notes) has been converted into a **Quartz** digital garden site:
graph view, full-text search, backlinks, table of contents, dark mode, and your
wikilinks/callouts all working out of the box.

## What's in this folder

- `content/` — your notes, copied straight from the Obsidian vault
- `quartz.config.yaml` — site config (title, theme, plugins)
- everything else is the Quartz engine itself (don't need to touch it)

`node_modules/` and `public/` (the built site) were **not** copied here since they're
large/regeneratable — you'll create them with the commands below.

## 1. First-time setup (on your own machine)

```bash
cd HumanOS-site
npm install
```

## 2. Preview locally

```bash
npx quartz build --serve
```

Open http://localhost:8080 — this is your live site with hot reload as you edit notes.

## 3. Before you deploy: set your domain

Open `quartz.config.yaml` and replace the placeholder:

```yaml
baseUrl: humanos.example.com  # TODO: replace with your real domain before deploying
```

with your actual domain (no `https://`, no trailing slash).

## 4. Push to GitHub

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(A local git repo with your first commit is already set up in this folder.)

## 5. Deploy (domain bought, host not chosen yet)

Two easy free options that work well with Quartz + a custom domain:

**Cloudflare Pages** (recommended if your domain's DNS can point to Cloudflare)
1. Cloudflare dashboard → Workers & Pages → Create → Pages → connect your GitHub repo
2. Build command: `npx quartz build`
3. Output directory: `public`
4. Add your custom domain under the Pages project's "Custom domains" tab

**Vercel**
1. vercel.com → New Project → import your GitHub repo
2. Build command: `npx quartz build`
3. Output directory: `public`
4. Add your domain under Project Settings → Domains, then update your registrar's
   nameservers/DNS records as Vercel instructs

Either way: once connected, every `git push` automatically rebuilds and redeploys the site.

## Ongoing workflow

Keep writing notes in Obsidian in your vault as usual. When you want to publish updates,
copy the changed notes into this project's `content/` folder (or point Quartz's `content/`
folder directly at your vault — see Quartz docs) and `git push`.

## Notes on this build

- Theme: minimal/clean — Manrope (headings) + Inter (body) + IBM Plex Mono (code)
- Graph view, search, backlinks, TOC, dark mode, reader mode: all enabled
- Verified: all 178 notes build cleanly, all wikilinks resolve, no broken links,
  Obsidian callouts render correctly, logo/images resolve correctly
- Full Quartz docs: https://quartz.jzhao.xyz/
