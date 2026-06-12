# 🏆 Rockmount Lunchtime League — Website

A full multi-page website for the RLL, pulling live data from your Google Sheet.

---

## ✨ v2 "Liquid Glass" Upgrade

- **css/v2.css** — iOS-26-style liquid glass design layer (loads after style.css on every page). Aurora ambient background, floating glass nav, glass cards with specular edges, spring animations, reduced-motion support.
- **Player photos** — NEW column **S** in the players range (`K26:S49`): a still photo URL shown as an avatar everywhere a player's name appears (tables, chips, fantasy cards, popups, leaderboards). The existing IMAGE column (O, your gif) is still used as the big media in the player popup.
- **Match detail modal** — click/tap any match in History or Recent Games for a full breakdown: result chips, computed **Best Performer rating** (goals×2 + assists×1 + MOTM×6), goal share bar, per-player match performances.
- **Season in Numbers** — animated stat scroll section on the home page (total goals, golden boot, MOTM king, best single performance of the season, biggest win, goal battle bar).
- **Live ticker** — marquee of recent results, MOTMs and scorers under the hero.
- **Head-to-Head** — compare any two players side-by-side on the Players page.
- **Player popup v2** — glass sheet with photo, position chip and a 4-stat grid (goals / assists / MOTM / fantasy pts; GK gets GK pts + price).

> 📸 **To add player photos:** put a direct image URL in column **S** of each player's row (same rows as K26:R49). Leave blank for the initials fallback.

---

## 📁 File Structure

```
rll/
├── index.html        ← Home page (hero, standings, latest match, wins, goals)
├── sylvans.html      ← Sylvans FC team page (red branding)
├── cpfc.html         ← Charlie Prevost FC page (blue branding)
├── history.html      ← Full match history with filters
├── about.html        ← About the league
├── css/
│   └── style.css     ← All shared styles
├── js/
│   ├── config.js     ← ✏️  YOUR DATA CONFIG — edit this file!
│   ├── data.js       ← Google Sheets fetching logic (don't edit)
│   └── main.js       ← Animations & shared JS (don't edit)
└── assets/
    ├── sylvans-logo.svg   ← Drop your Sylvans logo here
    └── cpfc-logo.svg      ← Drop your CP FC logo here
```

---

## ⚡ Quick Setup

### 1. Add your Google Sheet ID

Open `js/config.js` and paste your Sheet ID:

```js
SHEET_ID: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
```

Find your Sheet ID in the URL:
`https://docs.google.com/spreadsheets/d/` **`THIS_PART`** `/edit`

### 2. Publish your Sheet

In Google Sheets:
- **File → Share → Publish to web**
- Select **Entire Document** and **CSV**
- Click **Publish**

This makes it publicly readable (the site needs to read it).

### 3. Map your cells

In `js/config.js`, update each cell reference to match your sheet:

```js
CELLS: {
  SYLVANS_POINTS:     "D6",   // ← change to your cell
  CPFC_POINTS:        "D8",
  SYLVANS_WINS:       "E6",
  CPFC_WINS:          "E8",
  // ... etc
},
```

### 4. Map your history range

```js
HISTORY_RANGE: "C18:F40",   // ← the range with your match history

HISTORY_COLS: {
  DATE:          0,   // C = column 0 (first in your range)
  SYLVANS_SCORE: 1,   // D = column 1
  CPFC_SCORE:    2,   // E = column 2
  MOTM:          3,   // F = column 3
},
```

### 5. Add team logos

Drop your logo files into an `assets/` folder as:
- `assets/sylvans-logo.svg` (or .png)
- `assets/cpfc-logo.svg` (or .png)

If no logos are found, placeholder initials will be shown automatically.

---

## 🎨 Colours & Branding

All colours are CSS variables in `css/style.css`:

```css
--sylvans:    #e63030;   /* Sylvans red */
--cpfc:       #1a6dd4;   /* CP FC blue  */
```

Change these to match your exact brand colours.

---

## 🚀 Hosting

This is a static site — just drop it onto any host:

- **GitHub Pages** — free, works great
- **Netlify** / **Vercel** — drag and drop
- Any web server / hosting

No backend needed — all data comes live from your Google Sheet!

---

## 📝 Updating Scores

Just update your Google Sheet. The site fetches live data on every page load.
No code changes needed. ✅
