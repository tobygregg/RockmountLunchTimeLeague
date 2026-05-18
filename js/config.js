/* =====================================================
   ROCKMOUNT LUNCHTIME LEAGUE — config.js
===================================================== */

const RLL_CONFIG = {

  SHEET_ID:   "1MKzj6fGVqAwzKjS0qXVnMj8mlust_amG_s3-OoJDO3A",
  SHEET_NAME: "SFC Rockmount League",

  /* ── LEAGUE TABLE CELLS ────────────────────────── */
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
    ANNOUNCEMENT:          "K11",
  },

  /* ── MATCH HISTORY ─────────────────────────────────
     Columns: Date | Sylvans | CPFC | MOTM | Scorers | Assists
     Newest match at the BOTTOM. Older rows can have empty Assists — fine.
  ─────────────────────────────────────────────────── */
  HISTORY_RANGE: "B26:G110",
  HISTORY_COLS: {
    DATE: 0, SYLVANS_SCORE: 1, CPFC_SCORE: 2, MOTM: 3, SCORERS: 4, ASSISTS: 5,
  },

  /* ── PLAYERS TABLE ─────────────────────────────────
     Columns: Name | Team | Number | Bio | Image URL | Position | Price
     Position and Price can be empty for some players — fine.
  ─────────────────────────────────────────────────── */
  PLAYERS_RANGE: "K26:P49",
  PLAYERS_COLS: { NAME:0, TEAM:1, NUMBER:2, BIO:3, IMAGE:4, POSITION:5, PRICE:6 },

  /* ── ANNOUNCEMENTS ─────────────────────────────────
     Tab name: Announcements  |  Cols: Date | Message
  ─────────────────────────────────────────────────── */
  ANNOUNCEMENTS_RANGE: "Announcements!Q12:R29",
  ANNOUNCEMENTS_COLS:  { DATE:0, MESSAGE:1 },

  /* ── CHAT & FANTASY (Google Apps Script URL) ───── */
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbw0yfi1QrJf8Mf8QrJfl1V-qEDp2nT4ui0OVXd9AJkJZiiEXG4vbQ9vDLc-eaeuM1Okvw/exec",

  /* ── FANTASY SCORING ───────────────────────────── */
  FANTASY: {
    BUDGET:       50,
    SQUAD_SIZE:   5,
    MAX_SELLS:    3,
    POINTS_MOTM:  6,
    POINTS_GOAL:  2,
    POINTS_ASSIST:1,
    GK_BASE:      10,   // per match, minus goals conceded, min 0
    CAPTAIN_MULT: 2,
  },

  /* ── TEAMS ─────────────────────────────────────── */
  TEAMS: {
    SYLVANS: { name:"Sylvans FC",         shortName:"Sylvans", abbr:"SYL",  color:"#e63030", key:"Sylvans" },
    CPFC:    { name:"Charlie Prevost FC", shortName:"CP FC",   abbr:"CPFC", color:"#1a6dd4", key:"CPFC"    },
  },

  /* ── DEMO DATA ─────────────────────────────────── */
  DEMO: {
    sylvansPoints:12, cpfcPoints:9,
    sylvansWins:4,    cpfcWins:3,
    sylvansDraws:0,   cpfcDraws:0,
    sylvansLosses:2,  cpfcLosses:3,
    sylvansGoalsFor:18,     cpfcGoalsFor:14,
    sylvansGoalsAgainst:10, cpfcGoalsAgainst:16,
    sylvansPlayed:6, cpfcPlayed:6,
    history: [
      { date:"12 Jun 2025", sylvans:3, cpfc:1, motm:"T. Walsh",     scorers:["T. Walsh","J. Rockmount","M. Smith"], assists:["M. Smith","K. Briggs"] },
      { date:"5 Jun 2025",  sylvans:2, cpfc:2, motm:"C. Prevost",   scorers:["M. Smith","T. Walsh","D. Clarke","C. Prevost"], assists:["R. Hunt","M. Jones"] },
      { date:"29 May 2025", sylvans:1, cpfc:3, motm:"D. Clarke",    scorers:["J. Rockmount","M. Jones","D. Clarke","C. Prevost"], assists:["C. Prevost","A. Peters"] },
      { date:"22 May 2025", sylvans:4, cpfc:0, motm:"T. Walsh",     scorers:["T. Walsh","J. Rockmount","M. Smith","T. Walsh"], assists:["M. Smith"] },
      { date:"15 May 2025", sylvans:2, cpfc:3, motm:"M. Jones",     scorers:[], assists:[] },
      { date:"8 May 2025",  sylvans:6, cpfc:5, motm:"J. Rockmount", scorers:[], assists:[] },
    ],
    players: [
      { name:"J. Rockmount", team:"Sylvans", number:"1",  bio:"Commanding keeper.",        image:"", position:"GK",  price:8 },
      { name:"T. Walsh",     team:"Sylvans", number:"7",  bio:"Pacey winger.",             image:"", position:"MID", price:10 },
      { name:"M. Smith",     team:"Sylvans", number:"10", bio:"Creative playmaker.",       image:"", position:"MID", price:12 },
      { name:"K. Briggs",    team:"Sylvans", number:"4",  bio:"Solid defensive mid.",      image:"", position:"DEF", price:7 },
      { name:"R. Hunt",      team:"Sylvans", number:"8",  bio:"Box-to-box midfielder.",    image:"", position:"FWD", price:8 },
      { name:"C. Prevost",   team:"CPFC",    number:"10", bio:"Club founder, top player.", image:"", position:"FWD", price:12 },
      { name:"D. Clarke",    team:"CPFC",    number:"9",  bio:"Clinical finisher.",        image:"", position:"FWD", price:10 },
      { name:"M. Jones",     team:"CPFC",    number:"7",  bio:"Tricky winger.",            image:"", position:"MID", price:9 },
      { name:"A. Peters",    team:"CPFC",    number:"5",  bio:"Rock-solid at the back.",   image:"", position:"DEF", price:7 },
      { name:"L. Ford",      team:"CPFC",    number:"11", bio:"Dynamic forward.",          image:"", position:"GK",  price:8 },
    ],
    announcements: [
      { date:"12 Jun 2025", message:"Well played everyone on a brilliant 3–1 victory! 🔴" },
      { date:"5 Jun 2025",  message:"Cracking draw today — both teams gave it everything. ⚽" },
      { date:"1 Jun 2025",  message:"Welcome to the Rockmount Lunchtime League hub! 🏆" },
    ],
    matchChat:   [
      { ts: new Date(Date.now()-3600000).toISOString(),  name:"T. Walsh",     msg:"Get in!! What a result 🔥" },
      { ts: new Date(Date.now()-7200000).toISOString(),  name:"D. Clarke",    msg:"Good game lads" },
    ],
    generalChat: [
      { ts: new Date(Date.now()-86400000).toISOString(), name:"T. Walsh",    msg:"Who's confirmed for Wednesday?" },
      { ts: new Date(Date.now()-43200000).toISOString(), name:"M. Jones",    msg:"I'm in 💪" },
    ],
  },
};

/* ── Helpers ─────────────────────────────────────── */
function sheetUrlDirect(range) {
  const id = RLL_CONFIG.SHEET_ID;
  if (range.includes("!")) {
    const [tab, r] = range.split("!");
    return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}&range=${r}`;
  }
  const name = encodeURIComponent(RLL_CONFIG.SHEET_NAME);
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${name}&range=${range}`;
}

function parseCSVRow(row) {
  const result = []; let current = '', inQ = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') { if (inQ && row[i+1]==='"') { current+='"'; i++; } else inQ=!inQ; }
    else if (ch === ',' && !inQ) { result.push(current.trim()); current=''; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

function parseScorers(raw) {
  if (!raw || raw.trim()==="" || raw.trim()==="—") return [];
  return raw.split(",").map(s=>s.trim()).filter(Boolean);
}

function isSheetConfigured()      { return RLL_CONFIG.SHEET_ID       && RLL_CONFIG.SHEET_ID       !== "YOUR_SHEET_ID_HERE"; }
function isAppsScriptConfigured() { return RLL_CONFIG.APPS_SCRIPT_URL && RLL_CONFIG.APPS_SCRIPT_URL !== "YOUR_APPS_SCRIPT_URL"; }
