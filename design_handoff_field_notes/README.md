# Handoff: "Field Notes" — Personal Site Redesign

## Overview
This is a redesign of Bach Nguyen's personal portfolio (currently an Astro site deployed
to GitHub Pages). The new direction, **"Field Notes,"** presents the site as a runnable
data-science **notebook**: every section is a cell with `In [n]:` / `Out[n]:` prompts,
honest result "verdicts" render as output cells, experience is shown as a `git log`
commit history, and projects each have their own notebook write-up with real charts.
Two themes ship: a light "notebook" theme and a dark "terminal" theme.

## About the Design Files
The files in `design_files/` are **design references created in plain HTML/CSS/JS** —
prototypes that show the intended look, layout, and behavior. **They are not meant to be
shipped as-is.** The task is to **recreate these designs inside the existing Astro
codebase**, reusing its established patterns:

- The repo already uses **Astro** with **content collections** (`src/content/projects/*.md`
  and `src/content/blog/*.md`) and a `BaseLayout.astro`. Rebuild the design as Astro
  components/pages and **keep sourcing copy from the existing content collections** — do
  not hard-code the project/blog text that the prototypes contain inline.
- Port the shared chrome (toolbar, theme toggle, footer) into `BaseLayout.astro` /
  components so it isn't duplicated per page (the HTML prototypes duplicate it only
  because they're standalone files).
- Keep the existing routing (`/`, `/projects`, `/projects/[slug]`) and add an
  `/experience` route. The per-project "notebook" pages map onto the existing
  `projects/[slug].astro` dynamic route.

## Fidelity
**High-fidelity (hi-fi).** Final colors, typography, spacing, and interactions are all
specified below and in the CSS. Recreate the UI to match, using the tokens in
`design_files/notebook.css` as the source of truth.

---

## Design Tokens
All tokens are CSS custom properties in **`design_files/notebook.css`** (`:root` = light,
`[data-theme='dark']` = dark). Copy them verbatim.

### Type
- **Mono** (code, labels, nav, tags, chart text): `JetBrains Mono` (Google Fonts, 400–700)
- **Serif** (prose, headlines, body): `Newsreader` (Google Fonts, opsz 6–72, 400–700)
- Base body `18px` / line-height `1.6`. Headings line-height `1.16`.
- Headline `clamp()`: h1 `clamp(2.4rem,6vw,3.6rem)`, h2 `clamp(1.5rem,3.2vw,2rem)`, h3 `1.3rem`.

### Color — light ("notebook")
| Token | Value | Use |
|---|---|---|
| `--bg` | `#e9ecf1` | page background |
| `--cell` | `#ffffff` | cell surface |
| `--cell-code` | `#f5f7fa` | code-cell tint |
| `--cell-tint` | `#f0f5ff` | callout tint |
| `--ink` | `#19202e` | primary text |
| `--muted` | `#57637a` | secondary text |
| `--faint` | `#8a94a8` | tertiary / captions |
| `--line` | `#e4e8ef` | hairline borders |
| `--line-2` | `#d2d9e4` | stronger borders |
| `--accent` | `#2f5fd0` | notebook blue (links, `In [ ]`, primary btn) |
| `--accent-soft` | `#e7eefc` | accent wash |
| `--out` | `#c0561f` | rust — `Out[ ]` prompts, verdicts |
| `--ok` | `#1f9d57` | success / kernel dot |

### Color — dark ("terminal")
`--bg #0a0e15` · `--cell #121822` · `--cell-code #0e141d` · `--ink #e6edf3` ·
`--muted #93a0b3` · `--faint #5e6c80` · `--line #1f2835` · `--line-2 #2c3848` ·
`--accent #6aa0ff` · `--accent-soft #16243d` · `--out #ff9e64` · `--ok #4ec98a`.

### Chart palette (matplotlib default cycle)
`--c0` blue · `--c1` orange · `--c2` green · `--c3` red · `--c4` purple.
Light: `#1f77b4 / #ff7f0e / #2ca02c / #d62728 / #9467bd`.
Dark: `#58a6ff / #ffa657 / #56d364 / #ff6a69 / #bc8cff`.

### Other
- Radius: cells/cards `10px`, buttons `8px`, chips `6px`. Shadows `--shadow`, `--shadow-sm`.
- Layout: notebook column `max-width:880px`, centered. Cell grid = `[84px gutter][1fr body]`;
  gutter collapses to 0 below 760px (prompt moves inline).

---

## Global Chrome (every page)

### Toolbar (sticky top)
- Left: **kernel indicator** — green `--ok` dot with glow ring + `bach · python 3 · idle`
  (mono). Notebook pages that "run" show `running…`.
- Center/right: **nav** (mono): `README · projects · experience · writing · contact`.
  Active link = `--accent` text on `--accent-soft` pill (derive from `Astro.url.pathname`).
- Far right: **theme toggle** pill — sun/moon icon + `light`/`dark` label. Toggles
  `data-theme` on `<html>`, persists `localStorage['fn-theme']`, re-renders charts.
  Nav hides below 720px (use the codebase's mobile-menu pattern).

### Footer
Mono, two lines: left `…ipynb · kernel: python 3`, right
`built with too much coffee in Oshawa / Toronto`. Top hairline border.

---

## Pages / Routes

### 1. `/` — Home (README) · `design_files/index.html`
1. **In [1] Hero** — square avatar slot (92px → `profile.jpg`), eyebrow
   `student data scientist · oshawa → toronto`, h1 name, lead, social handles
   (GitHub/LinkedIn/Kaggle, mono), buttons `▶ run projects` (→/projects) + `say hi` (→#contact).
2. **In [2] README/About** — markdown-style prose cell (no chrome).
3. **In [3] `me.currently()`** → **Out [3]** the *currently into* strip: 5 cards
   (Reading: Gorky · On repeat: The Smiths · Forever: Barça·Arsenal · Comfort: Good Will
   Hunting · Unwinding: FC·League). Card = emoji, mono uppercase label, serif value.
4. **In [4]/[5] Featured projects** — two cards: meta tag, h3, summary, chips, a rust
   **verdict** callout, and a chart (`equity`, then `loss`). xG card → `read notebook →`;
   Nested Learning → GitHub.
5. **In [6] toolkit** — `toolkit.groups()` → grouped skill chips.
6. **In [7] `predict_joy(week)`** → **Out [7]** playful "xG of my week" bar chart.
7. **In [8] Contact** — accent-bordered callout, "OPEN TO" label, Email + Résumé buttons.

The git-log experience was intentionally moved off home onto `/experience`.

### 2. `/projects` — Projects · `design_files/projects.html`
- Intro cell (`/projects`, h1 **Projects**).
- **In [2]** `projects.sort_values("year")` → **Out [2]** a `.df` DataFrame table of all 7
  projects: `# · experiment · domain · year · headline · notebook`. The `notebook` column
  shows `✓ open` (link) for projects with a write-up, else `—`.
- **In [3]** expanded cards (one per project): meta, h3, summary, chips, buttons. Projects
  with notebooks get `read notebook →` + GitHub; others GitHub only. **Drive everything
  from the `projects` content collection** (`featured`, `domain`, `tags`, `github`, body).

### 3. `/experience` — Experience · `design_files/experience.html`
- Intro cell (`/experience`, h1 **Experience**).
- **In [2]** `git log --oneline --author="Bach" career/` → **Out [2]** a commit-history
  timeline (`.gitlog`/`.commit`): each role = rust hash, green `(role/…)` ref, date+location,
  serif role title, bullets. Four entries: IT Intern (CMHA), Data Engineer (Statistics
  Without Borders), Events Coordinator & Peer Mentor (CS Club), degree (`tag: enrolled`).
  Vertical line + node dots connect them.
- Closing cell links to résumé + contact.

### 4. `/projects/[slug]` — Project notebooks
Three exemplars built; the rest follow the same template, driven by the `projects/*.md`
bodies:
- `notebook-xg.html` — TL;DR callout → charts `histogram` → `calibration` → results `.df`
  → `equity`, rust verdict.
- `notebook-chest-xray.html` — metrics table, `confusion` + `prcurve`, 3-up Grad-CAM image
  slots, verdict.
- `notebook-energy.html` — leaderboard `.df`, `modelbars` + `forecast`, verdict.

Template: `In [1]` title cell (eyebrow `notebook · <domain> · <year>`, h1, lead question,
chips, GitHub + `← all projects`) → `Out [1]` TL;DR callout → numbered `# 0n —` sections
(prose + chart output cells) → `# the honest verdict` output cell + CTA.

### 5. `/writing` (or `/blog`) · `design_files/blog.html`
Intro cell → **Out [1]** post list (`.post`): mono meta (`# date · tags · read time`),
serif h3 title, muted standfirst. Source from the `blog` collection.

---

## Components (see `notebook.css`)
`.cell`/`.gutter`/`.body-cell` (+`.code`,`.output`,`.md`) · `.callout` (accent) · `.verdict`
(rust) · `.chip` (+`.accent`) · `.btn` (+`.primary`) · `.btn-row` · `.into` cards ·
`.gitlog`/`.commit` · `.df` table · `.pipeline` numbered list · `.post` row · `.chart`
SVG frame · `.avatar` image slot.

## Interactions
- **Theme toggle** — flips `data-theme`, persists `localStorage['fn-theme']`, re-renders
  charts. Default = light.
- **Run-cell flourish** — on scroll-in, non-markdown `.body-cell` gets `.run` (animates left
  border to `--accent`) via IntersectionObserver (`app.js`). `prefers-reduced-motion`
  disables all transitions (already in CSS).
- **Active nav** — highlight the current route's link.

## Charts
`design_files/charts.js` renders SVGs into `<div data-chart="<name>">`. Names: `calibration`,
`equity`, `histogram`, `loss`, `week`, `prcurve`, `confusion`, `modelbars`, `forecast`. They
read CSS vars so they re-theme. **Placeholder data** — encoded to match real headline numbers
(xG yield +5.7%, recall 96.9%, energy MAPE 0.81%) but replace with Bach's actual figures, or
swap in the real exported PNGs already in the repo under `src/assets/projects/<slug>/`.

## Assets to Swap In
- **`profile.jpg`** (already in `public/`) → hero avatar slot.
- **`Resume.pdf`** (already in `public/`) → contact/experience buttons.
- **Project figures** — real charts already exist at `src/assets/projects/<slug>/*.png`
  (calibration, equity, confusion matrix, Grad-CAM, model-comparison, predictions, SHAP).
- **Grad-CAM row** on chest-xray notebook = 3 image slots (original / Grad-CAM / Eigen-CAM).

## Files in `design_files/`
`index.html` · `projects.html` · `experience.html` · `notebook-xg.html` ·
`notebook-chest-xray.html` · `notebook-energy.html` · `blog.html` ·
`notebook.css` (design system / tokens — source of truth) · `charts.js` · `app.js`

## Existing codebase this maps onto
Astro: `src/pages/index.astro`, `src/pages/projects/index.astro`,
`src/pages/projects/[slug].astro`, `src/layouts/BaseLayout.astro`,
`src/components/{Header,Footer}.astro`, `src/styles/global.css`, content under
`src/content/{projects,blog}/`. Replace `global.css` with the `notebook.css` token set,
rework `BaseLayout` + Header/Footer into the toolbar/footer chrome, restyle pages as
notebook cells, add the `/experience` route, and keep all copy coming from the content
collections.
