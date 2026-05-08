/* =====================================================
   ROCKMOUNT LUNCHTIME LEAGUE — data.js
   Handles all Google Sheets fetching + parsing.
   Falls back to demo data if sheet isn't configured.
===================================================== */

const RLLData = (() => {

  /* ---- Internal cache ---- */
  let _cache = null;
  let _promise = null;

  /* ──────────────────────────────────────────────────
     Core fetch: grab a range as CSV, return 2D array
  ────────────────────────────────────────────────── */
  async function fetchRange(range) {
    const url = sheetUrl(range);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    const text = await res.text();
    return text.trim().split("\n").map(parseCSVRow);
  }

  /* ──────────────────────────────────────────────────
     Convert a cell reference like "D6" into a
     single-cell range and return the value as string.
  ────────────────────────────────────────────────── */
  async function fetchCell(ref) {
    try {
      const rows = await fetchRange(ref);
      return rows[0]?.[0] ?? "";
    } catch {
      return null;
    }
  }

  /* ──────────────────────────────────────────────────
     Fetch all cells in parallel and return a flat map.
  ────────────────────────────────────────────────── */
  async function fetchAllCells() {
    const C = RLL_CONFIG.CELLS;
    const entries = Object.entries(C);

    const values = await Promise.all(
      entries.map(([, ref]) => fetchCell(ref))
    );

    const result = {};
    entries.forEach(([key], i) => {
      result[key] = values[i];
    });
    return result;
  }

  /* ──────────────────────────────────────────────────
     Fetch game history range
  ────────────────────────────────────────────────── */
  async function fetchHistory() {
    const rows = await fetchRange(RLL_CONFIG.HISTORY_RANGE);
    const C = RLL_CONFIG.HISTORY_COLS;

    return rows
      .filter(row => row[C.DATE] && row[C.SYLVANS_SCORE] !== "" && row[C.CPFC_SCORE] !== "")
      .map(row => ({
        date:    row[C.DATE]   || "",
        sylvans: parseInt(row[C.SYLVANS_SCORE], 10) || 0,
        cpfc:    parseInt(row[C.CPFC_SCORE],    10) || 0,
        motm:    row[C.MOTM]   || "—",
      }))
      /* Sort by date — most recent first.
         Tries to parse the date; falls back to order as-is */
      .sort((a, b) => {
        const da = new Date(a.date), db = new Date(b.date);
        if (isNaN(da) || isNaN(db)) return 0;
        return db - da;
      });
  }

  /* ──────────────────────────────────────────────────
     Master load function — returns the full data object.
     Caches so subsequent calls are instant.
  ────────────────────────────────────────────────── */
  async function load() {
    if (_cache) return _cache;
    if (_promise) return _promise;

    if (!isSheetConfigured()) {
      console.info("[RLL] Sheet not configured — using demo data.");
      _cache = buildFromDemo();
      return _cache;
    }

    _promise = (async () => {
      try {
        const [cells, history] = await Promise.all([
          fetchAllCells(),
          fetchHistory(),
        ]);

        _cache = buildFromSheet(cells, history);
        return _cache;
      } catch (err) {
        console.warn("[RLL] Sheet fetch error, falling back to demo data.", err);
        _cache = buildFromDemo();
        return _cache;
      } finally {
        _promise = null;
      }
    })();

    return _promise;
  }

  /* ──────────────────────────────────────────────────
     Build the normalised data object from live cells
  ────────────────────────────────────────────────── */
  function buildFromSheet(cells, history) {
    const n = v => parseInt(v, 10) || 0;

    const sylvansGoalsFor     = n(cells.SYLVANS_GOALS_FOR);
    const cpfcGoalsFor        = n(cells.CPFC_GOALS_FOR);
    const sylvansGoalsAgainst = n(cells.SYLVANS_GOALS_AGAINST);
    const cpfcGoalsAgainst    = n(cells.CPFC_GOALS_AGAINST);

    return {
      sylvansPoints:  n(cells.SYLVANS_POINTS),
      cpfcPoints:     n(cells.CPFC_POINTS),
      sylvansWins:    n(cells.SYLVANS_WINS),
      cpfcWins:       n(cells.CPFC_WINS),
      sylvansDraws:   n(cells.SYLVANS_DRAWS),
      cpfcDraws:      n(cells.CPFC_DRAWS),
      sylvansLosses:  n(cells.SYLVANS_LOSSES),
      cpfcLosses:     n(cells.CPFC_LOSSES),
      sylvansGoalsFor,
      cpfcGoalsFor,
      sylvansGoalsAgainst,
      cpfcGoalsAgainst,
      sylvansPlayed:  n(cells.SYLVANS_PLAYED),
      cpfcPlayed:     n(cells.CPFC_PLAYED),
      totalGoals:     sylvansGoalsFor + cpfcGoalsFor,
      history,
      latestMatch:    history[0] || null,
      fromDemo: false,
    };
  }

  /* ──────────────────────────────────────────────────
     Build from static demo data in config.js
  ────────────────────────────────────────────────── */
  function buildFromDemo() {
    const D = RLL_CONFIG.DEMO;
    return {
      ...D,
      totalGoals: D.sylvansGoalsFor + D.cpfcGoalsFor,
      latestMatch: D.history[0] || null,
      fromDemo: true,
    };
  }

  /* ──────────────────────────────────────────────────
     Helpers exposed to the pages
  ────────────────────────────────────────────────── */

  /** Win rate as a percentage string, e.g. "66.7" */
  function winRate(wins, played) {
    if (!played) return "0.0";
    return ((wins / played) * 100).toFixed(1);
  }

  /** Determine result string for a history row from a team's POV */
  function matchResult(match, team /* "sylvans" | "cpfc" */) {
    const s = match.sylvans, c = match.cpfc;
    if (s === c) return "D";
    if (team === "sylvans") return s > c ? "W" : "L";
    return c > s ? "W" : "L";
  }

  /** Get the last N results as W/L/D array for a team */
  function recentForm(history, team, n = 5) {
    return history.slice(0, n).map(m => matchResult(m, team));
  }

  return { load, winRate, matchResult, recentForm };
})();
