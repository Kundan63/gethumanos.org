# Making HumanOS Live — Beginner Step-by-Step

Follow these in order. Every command goes into the Mac **Terminal** app (search for
"Terminal" in Spotlight — press Cmd+Space, type Terminal, hit Enter).

---

## Step 1 — Install the tools (one-time only)

**Git:** type this and press Enter:
```
git -v
```
If it's not installed, macOS will pop up a prompt to install "Command Line Developer
Tools" — click Install and wait a few minutes, then continue.

**Node.js:** go to https://nodejs.org, download the "LTS" installer, open it, click
through Next/Install like any Mac app. When done, check it worked:
```
node -v
```
You should see a version number like `v22.x.x`.

---

## Step 2 — Open your project folder in Terminal

```
cd ~/Downloads/HumanOS-site
```

## Step 3 — Install the site's dependencies

```
npm install
```
This takes a minute or two and prints a lot of text — that's normal. Wait for it to
finish and give you back a new prompt line.

## Step 4 — Preview your site on your own computer

```
npx quartz build --serve
```
Leave this running, then open a web browser and go to:
```
http://localhost:8080
```
You should see your HumanOS site. Click around — graph view, search, your notes should
all work. When you're happy, go back to Terminal and press **Control+C** to stop the
preview.

---

## Step 5 — Set your real domain in the config

1. Open the `HumanOS-site` folder in Finder.
2. Open `quartz.config.yaml` with TextEdit (right-click → Open With → TextEdit).
3. Find this line near the top:
   ```
   baseUrl: humanos.example.com  # TODO: replace with your real domain before deploying
   ```
4. Replace `humanos.example.com` with your actual domain (just the domain, no `https://`,
   no trailing slash), e.g. `humanos.dev`. Delete the `# TODO...` comment too.
5. Save the file (Cmd+S) and close TextEdit.

## Step 6 — Create a GitHub account and a repository

1. Go to https://github.com and sign up (skip if you already have an account).
2. Once logged in, click the **+** in the top right → **New repository**.
3. Name it `humanos-site` (or anything you like).
4. Leave it **Public** or **Private**, your choice.
5. **Do not** check "Add a README" — leave everything else unchecked.
6. Click **Create repository**.
7. On the next page, copy the URL under "…or push an existing repository from the
   command line" — it looks like `https://github.com/yourname/humanos-site.git`.

## Step 7 — Push your site to GitHub

Back in Terminal (still inside the `HumanOS-site` folder):
```
git remote add origin PASTE_YOUR_URL_HERE
git push -u origin main
```
The first time, a browser window may pop up asking you to log into GitHub — do that,
then return to Terminal.

## Step 8 — Deploy on Cloudflare Pages (free)

1. Go to https://dash.cloudflare.com and sign up / log in.
2. In the left sidebar, click **Workers & Pages**.
3. Click **Create** → **Pages** → **Connect to Git**.
4. Authorize Cloudflare to access GitHub, then select your `humanos-site` repository.
5. On the build settings screen, enter:
   - **Build command:** `npx quartz build`
   - **Build output directory:** `public`
6. Click **Save and Deploy**. Wait 1–2 minutes — Cloudflare will give you a working link
   like `humanos-site.pages.dev`. Open it to confirm your site is live.

## Step 9 — Connect your real domain

1. Still in the Cloudflare Pages project, go to the **Custom domains** tab.
2. Click **Set up a custom domain**, type your domain (e.g. `humanos.dev`), click
   **Continue**, then **Activate domain**.
3. Cloudflare will tell you exactly what DNS records to add:
   - **If you bought your domain through Cloudflare**: this happens automatically, no
     extra steps.
   - **If you bought it elsewhere** (Namecheap, GoDaddy, Google Domains, etc.): log into
     that registrar, find "DNS settings" or "Nameservers," and either add the CNAME
     record Cloudflare shows you, or switch your domain's nameservers to the two
     Cloudflare gives you (Cloudflare's dashboard walks you through whichever applies).
4. DNS changes can take anywhere from a few minutes to a few hours to take effect.
   Once they do, your domain will show your HumanOS site.

---

## After that: publishing new notes

Whenever you add or edit notes in Obsidian and want them live:
1. Copy the changed `.md` files into `HumanOS-site/content/` (matching the same folder
   structure as your vault).
2. In Terminal, inside `HumanOS-site`:
   ```
   git add -A
   git commit -m "update notes"
   git push
   ```
3. Cloudflare automatically rebuilds and redeploys within a minute or two — no dashboard
   visit needed.

---

## If something goes wrong

- **`npm install` fails** — make sure Node.js installed correctly (Step 1), then try again.
- **`git push` asks for a password and rejects it** — GitHub no longer accepts your
  account password for this; a browser login popup (as described in Step 7) should
  appear instead. If it doesn't, search "GitHub git push authentication" for the current
  method, since GitHub updates this occasionally.
- **Site builds but looks broken** — check the Cloudflare Pages "deployment log" for the
  failed step; the most common cause is a typo in the build command or output directory
  (Step 8).
