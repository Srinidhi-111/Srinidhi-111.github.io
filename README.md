# Srinidhi R · Portfolio

My personal portfolio: a single page with an animated night sky (twinkling stars, breathing constellations, shooting stars that react to the mouse), my journey, skills and projects.

Built from scratch with plain HTML, CSS and JavaScript. No frameworks, no build step. Hosted free on GitHub Pages.

**Live:** https://srinidhi-111.github.io

---

## What's in this folder

| File or folder | What it does |
|---|---|
| `index.html` | All the content: every section, every word and link |
| `css/style.css` | How everything looks: colours, fonts, spacing, phone layout |
| `js/main.js` | Everything that moves: the night sky, typing titles, menu, scroll animations, contact form |
| `images/` | Project pictures and the browser-tab icon |
| `assets/` | Put your résumé PDF here (see step 4) |

---

## Putting it online (GitHub Pages, free)

### 1. Create the repository
1. Go to github.com and click **New** (the green button) to create a repository.
2. Name it exactly **`Srinidhi-111.github.io`**. This special name makes GitHub host it at `https://srinidhi-111.github.io`.
3. Set it to **Public**, leave everything else unticked, and click **Create repository**.

### 2. Upload the files
The safest way, which keeps folders intact:
1. Go to **github.dev/Srinidhi-111/Srinidhi-111.github.io** (your repo address with `.com` changed to `.dev`). It opens a VS Code editor in your browser.
2. From your computer, drag **everything inside this folder** (`index.html`, `README.md`, and the `css`, `js` and `images` folders) into the file panel on the left.
3. Click the **Source Control** icon on the far left, type a message like "First version of portfolio", and click **Commit & Push**.
4. Check the repo on github.com. You should see `index.html` at the top level, with `css`, `js` and `images` as folders. If the files ended up loose without their folders, move them back into the right folders before continuing.

### 3. Turn on GitHub Pages
1. In the repository, open **Settings → Pages** (in the left sidebar).
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Set **Branch** to **main** and the folder to **/ (root)**, then click **Save**.
4. Wait one or two minutes, then open **https://srinidhi-111.github.io**.

### 4. Add your résumé
1. Export your résumé from Overleaf as a PDF.
2. Rename it to exactly **`Srinidhi_R_Resume.pdf`**.
3. Upload it into a folder called **`assets`** (in github.dev: right-click the file panel → **New Folder** → `assets`, then drag the PDF into it).
The two Résumé buttons on the site already point to `assets/Srinidhi_R_Resume.pdf`.

### 5. Connect the contact form (free)
GitHub Pages can't send email by itself, so the form uses **Formspree**, a free service that forwards messages to your inbox.
1. Sign up at **formspree.io** with your email.
2. Click **New Form**, give it a name like "Portfolio", and create it.
3. Formspree shows an address like `https://formspree.io/f/abcd1234`. The last part (`abcd1234`) is your form ID.
4. In `index.html`, search for **`YOUR_FORM_ID`** and replace it with your ID.
5. Commit and push. Send yourself a test message from the live site.

Until you do this, the form politely tells visitors to email you directly instead.

---

## Changing things later

| To change… | Edit this | Look for |
|---|---|---|
| Any text, link or section | `index.html` | Comments like `<!-- ABOUT -->` mark each section |
| The words that type under your name | `js/main.js` | `const TITLES = [...]` |
| The accent colour (the icy blue) | `css/style.css` | `--accent` and `--accent-glow` at the top; also `ACCENT` in `js/main.js` |
| How many shooting stars | `js/main.js` | `rand(1.6, 4.2)` in `spawnShootingStar`: the seconds between shooting stars |
| How fast the constellation lines breathe | `js/main.js` | `BREATH_SECONDS` |
| A project picture | `images/` | Replace `session-replay.svg` etc. A real screenshot works too: save it as `session-replay.png` and change the `src` in `index.html` to match |

After any change: commit and push, wait a minute, then hard-refresh the site with **Ctrl+Shift+R**.

---

## Accessibility

- The sky pauses when it's scrolled out of view, to save battery.
- People who switch off animations in their device settings get a still sky and no movement.
- Every button and link can be reached with the keyboard, and all icons have labels for screen readers.
