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
     Individual cells for live stats. Format: "A1", "D6" etc.
  ─────────────────────────────────────────────────── */
  CELLS: {
    SYLVANS_POINTS:        "E6",
    CPFC_POINTS:           "G6",
    SYLVANS_WINS:          "F12",
    CPFC_WINS:             "G12",
    SYLVANS_DRAWS:         "H12",
    CPFC_DRAWS:            "H12",
    SYLVANS_LOSSES:        "G12",
    CPFC_LOSSES:           "F12",
    SYLVANS_GOALS_FOR:     "B12",
    CPFC_GOALS_FOR:        "C12",
    SYLVANS_GOALS_AGAINST: "C12",
    CPFC_GOALS_AGAINST:    "B12",
    SYLVANS_PLAYED:        "I12",
    CPFC_PLAYED:           "I12",
  },

  /* ── GAME HISTORY RANGE ───────────────────────────
     Columns in order:
       Date | Sylvans Score | CPFC Score | Man of the Match | Scorers
     ⚠️  Extend range to include the new Scorers column!
     e.g. if Scorers is column G: "C18:G40"
     Older rows without scorer data are handled gracefully.
  ─────────────────────────────────────────────────── */
  HISTORY_RANGE: "B26:F110",

  HISTORY_COLS: {
    DATE:          0,   // C
    SYLVANS_SCORE: 1,   // D
    CPFC_SCORE:    2,   // E
    MOTM:          3,   // F
    SCORERS:       4,   // G  ← NEW — comma-separated, e.g. "Tom LT, Evan H, Ben T"
  },

  /* ── PLAYERS TABLE ────────────────────────────────
     A separate table in your sheet with squad data.
     Columns in order:  Name | Team ("Sylvans" or "CPFC") | Number
     e.g. "A2:C20" — change to match your sheet.
     Team values must be exactly "Sylvans" or "CPFC".
  ─────────────────────────────────────────────────── */
  PLAYERS_RANGE: "K26:M49",

  PLAYERS_COLS: {
    NAME:   0,   // e.g. "Tom LT"
    TEAM:   1,   // "Sylvans" or "CPFC"
    NUMBER: 2,   // up to 3 digits, may include minus sign
  },

  /* ── TEAM NAMES (cosmetic) ────────────────────────
     These must match the "Team" values in your Players table.
  ─────────────────────────────────────────────────── */
  TEAMS: {
    SYLVANS: {
      name:      "Sylvans FC",
      shortName: "Sylvans",
      abbr:      "SYL",
      color:     "#e63030",
      key:       "Sylvans",   // must match sheet value exactly
    },
    CPFC: {
      name:      "Charlie Prevost FC",
      shortName: "CPFC",
      abbr:      "CPFC",
      color:     "#1a6dd4",
      key:       "CPFC",      // must match sheet value exactly
    },
  },

  /* ── FALLBACK / DEMO DATA ─────────────────────────
     Shown when sheet isn't configured yet.
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
    sylvansGoalsFor:      18,
    cpfcGoalsFor:         14,
    sylvansGoalsAgainst:  10,
    cpfcGoalsAgainst:     16,
    sylvansPlayed:  6,
    cpfcPlayed:     6,
    history: [
      { date: "12 Jun 2025", sylvans: 3, cpfc: 1, motm: "J. Rockmount", scorers: ["T. Walsh", "J. Rockmount", "M. Smith"] },
      { date: "5 Jun 2025",  sylvans: 2, cpfc: 2, motm: "C. Prevost",   scorers: ["M. Smith", "T. Walsh", "D. Clarke", "C. Prevost"] },
      { date: "29 May 2025", sylvans: 1, cpfc: 3, motm: "D. Clarke",    scorers: ["J. Rockmount", "M. Jones", "D. Clarke", "C. Prevost"] },
      { date: "22 May 2025", sylvans: 4, cpfc: 0, motm: "T. Walsh",     scorers: ["T. Walsh", "J. Rockmount", "M. Smith", "T. Walsh"] },
      { date: "15 May 2025", sylvans: 2, cpfc: 3, motm: "M. Jones",     scorers: [] },
      { date: "8 May 2025",  sylvans: 6, cpfc: 5, motm: "J. Rockmount", scorers: [] },
    ],
    players: [
      { name: "J. Rockmount", team: "Sylvans", number: "1"  },
      { name: "T. Walsh",     team: "Sylvans", number: "7"  },
      { name: "M. Smith",     team: "Sylvans", number: "10" },
      { name: "K. Briggs",    team: "Sylvans", number: "4"  },
      { name: "R. Hunt",      team: "Sylvans", number: "8"  },
      { name: "C. Prevost",   team: "CPFC",    number: "10" },
      { name: "D. Clarke",    team: "CPFC",    number: "9"  },
      { name: "M. Jones",     team: "CPFC",    number: "7"  },
      { name: "A. Peters",    team: "CPFC",    number: "5"  },
      { name: "L. Ford",      team: "CPFC",    number: "11" },
    ],
  },
};

/* =====================================================
   Derived helpers — no need to edit below this line
===================================================== */

/**
 * Proper CSV row parser — handles quoted fields that contain commas.
 * Essential for the Scorers column, e.g. "Tom LT, Evan H, Ben T"
 */
function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') { current += '"'; i++; } // escaped quote
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/** Returns the Google Sheets CSV export URL for a given range */
function sheetUrl(range) {
  const base = "https://docs.google.com/spreadsheets/d";
  const id   = RLL_CONFIG.SHEET_ID;
  const name = encodeURIComponent(RLL_CONFIG.SHEET_NAME);
  return `${base}/${id}/gviz/tq?tqx=out:csv&sheet=${name}&range=${range}`;
}

/** Check if the sheet ID looks real */
function isSheetConfigured() {
  return RLL_CONFIG.SHEET_ID && RLL_CONFIG.SHEET_ID !== "YOUR_SHEET_ID_HERE";
}

/** Parse a scorers string "Tom LT, Tom LT, Evan H" into a trimmed array */
function parseScorers(raw) {
  if (!raw || raw.trim() === "" || raw.trim() === "—") return [];
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}
