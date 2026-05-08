/* =====================================================
   ROCKMOUNT LUNCHTIME LEAGUE — config.js
   ✏️  Edit ONLY this file to update your Google Sheet data.
   Make sure your Google Sheet is published to the web:
   File → Share → Publish to web → Entire Document → CSV
===================================================== */

const RLL_CONFIG = {

  /* ── GOOGLE SHEET ─────────────────────────────────
     Paste your Sheet ID from the URL:
     https://docs.google.com/spreadsheets/d/  <<<THIS BIT>>>  /edit
  ─────────────────────────────────────────────────── */
  SHEET_ID: "1MKzj6fGVqAwzKjS0qXVnMj8mlust_amG_s3-OoJDO3A",

  /* Sheet tab name (default is Sheet1, change if yours differs) */
  SHEET_NAME: "SFC Rockmount League",

  /* ── LEAGUE TABLE CELLS ───────────────────────────
     These are the individual cells where your live
     data lives. Format: "A1", "D6" etc.
  ─────────────────────────────────────────────────── */
  CELLS: {
    /* ---- Points ---- */
    SYLVANS_POINTS:     "E6",
    CPFC_POINTS:        "G6",

    /* ---- Wins ---- */
    SYLVANS_WINS:       "F12",
    CPFC_WINS:          "G12",

    /* ---- Draws ---- */
    SYLVANS_DRAWS:      "H12",
    CPFC_DRAWS:         "H12",

    /* ---- Losses ---- */
    SYLVANS_LOSSES:     "G12",
    CPFC_LOSSES:        "F12",

    /* ---- Goals For ---- */
    SYLVANS_GOALS_FOR:  "B12",
    CPFC_GOALS_FOR:     "C12",

    /* ---- Goals Against ---- */
    SYLVANS_GOALS_AGAINST: "C12",
    CPFC_GOALS_AGAINST:    "B12",

    /* ---- Games Played ---- */
    SYLVANS_PLAYED:     "I12",
    CPFC_PLAYED:        "I12",
  },

  /* ── GAME HISTORY RANGE ───────────────────────────
     The range that holds your match history table.
     Columns in order:  Date | Sylvans Score | CPFC Score | Man of the Match
     Example: "C18:F40" — change to match your sheet.
  ─────────────────────────────────────────────────── */
  HISTORY_RANGE: "B26:E110",

  /* Which column index (0-based) within your range each piece of data is:
     e.g. if range starts at col C:
       C=0 → Date
       D=1 → Sylvans Score
       E=2 → CPFC Score
       F=3 → Man of the Match
  */
  HISTORY_COLS: {
    DATE:   0,
    SYLVANS_SCORE: 1,
    CPFC_SCORE:    2,
    MOTM:   3,
  },

  /* ── TEAM NAMES (cosmetic) ────────────────────────
     Change these if you ever rename the teams.
  ─────────────────────────────────────────────────── */
  TEAMS: {
    SYLVANS: {
      name:      "Sylvans FC",
      shortName: "Sylvans",
      abbr:      "SYL",
      color:     "#e63030",
    },
    CPFC: {
      name:      "Charlie Prevost FC",
      shortName: "CP FC",
      abbr:      "CPFC",
      color:     "#1a6dd4",
    },
  },

  /* ── FALLBACK / DEMO DATA ─────────────────────────
     Shown while the sheet loads, or if the Sheet ID
     hasn't been set yet. Keeps the site looking great
     even offline. Update these to match real data.
  ─────────────────────────────────────────────────── */
  DEMO: {
    sylvansPoints:  12,
    cpfcPoints:     9,
    sylvansWins:    4,
    cpfcWins:       3,
    sylvansDraws:   0,
    cpfcDraws:      0,
    sylvansLosses:  2,
    cpfcLosses:     3,
    sylvansGoalsFor: 18,
    cpfcGoalsFor:    14,
    sylvansGoalsAgainst: 10,
    cpfcGoalsAgainst:    16,
    sylvansPlayed:  6,
    cpfcPlayed:     6,
    history: [
      { date: "12 Jun 2025", sylvans: 3, cpfc: 1, motm: "J. Rockmount" },
      { date: "5 Jun 2025",  sylvans: 2, cpfc: 2, motm: "C. Prevost"   },
      { date: "29 May 2025", sylvans: 1, cpfc: 3, motm: "D. Clarke"    },
      { date: "22 May 2025", sylvans: 4, cpfc: 0, motm: "T. Walsh"     },
      { date: "15 May 2025", sylvans: 2, cpfc: 3, motm: "M. Jones"     },
      { date: "8 May 2025",  sylvans: 6, cpfc: 5, motm: "J. Rockmount" },
    ],
  },
};

/* =====================================================
   Derived helpers — no need to edit below this line
===================================================== */

/** Returns the Google Sheets CSV export URL for a given range */
function sheetUrl(range) {
  const base = "https://docs.google.com/spreadsheets/d";
  const id   = RLL_CONFIG.SHEET_ID;
  const name = encodeURIComponent(RLL_CONFIG.SHEET_NAME);
  return `${base}/${id}/gviz/tq?tqx=out:csv&sheet=${name}&range=${range}`;
}

/** Parses a simple CSV row string into an array of values */
function parseCSVRow(row) {
  return row.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
}

/** Converts a column letter + row number to A1 notation (already is, just validates) */
function cellRef(ref) { return ref.trim().toUpperCase(); }

/** Check if the sheet ID looks real */
function isSheetConfigured() {
  return RLL_CONFIG.SHEET_ID && RLL_CONFIG.SHEET_ID !== "YOUR_SHEET_ID_HERE";
}
