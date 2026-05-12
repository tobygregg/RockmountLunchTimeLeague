/* =====================================================
   ROCKMOUNT LUNCHTIME LEAGUE — data.js
   Fetches league data + player stats from Google Sheets.
   Falls back to demo data gracefully.
===================================================== */

const RLLData = (() => {

  let _cache = null;
  let _promise = null;

  /* ── SHEET FETCH ──────────────────────────────────── */
  async function fetchRange(range) {
    const url = sheetUrl(range);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    const text = await res.text();
    return text.trim().split("\n").map(parseCSVRow);
  }

  async function fetchCell(ref) {
    try {
      const rows = await fetchRange(ref);
      return rows[0]?.[0] ?? "";
    } catch { return null; }
  }

  async function fetchAllCells() {
    const entries = Object.entries(RLL_CONFIG.CELLS);
    const values  = await Promise.all(entries.map(([, ref]) => fetchCell(ref)));
    const result  = {};
    entries.forEach(([key], i) => { result[key] = values[i]; });
    return result;
  }

  /* ── HISTORY ──────────────────────────────────────── */
  async function fetchHistory() {
    const rows = await fetchRange(RLL_CONFIG.HISTORY_RANGE);
    const C = RLL_CONFIG.HISTORY_COLS;

    return rows
      .filter(row => row[C.DATE] && row[C.SYLVANS_SCORE] !== "" && row[C.CPFC_SCORE] !== "")
      .map(row => ({
        date:    row[C.DATE]          || "",
        sylvans: parseInt(row[C.SYLVANS_SCORE], 10) || 0,
        cpfc:    parseInt(row[C.CPFC_SCORE],    10) || 0,
        motm:    row[C.MOTM]          || "—",
        // Scorers col is optional — older rows may not have it
        scorers: C.SCORERS != null ? parseScorers(row[C.SCORERS] || "") : [],
      }))
      .reverse(); // newest at bottom of sheet → reverse so index 0 = latest
  }

  /* ── PLAYERS ──────────────────────────────────────── */
  async function fetchPlayers() {
    const rows = await fetchRange(RLL_CONFIG.PLAYERS_RANGE);
    const C = RLL_CONFIG.PLAYERS_COLS;

    return rows
      .filter(row => row[C.NAME] && row[C.TEAM])
      .map(row => ({
        name:   row[C.NAME].trim(),
        team:   row[C.TEAM].trim(),
        number: row[C.NUMBER] != null ? row[C.NUMBER].trim() : "",
      }));
  }

  /* ── MASTER LOAD ──────────────────────────────────── */
  async function load() {
    if (_cache)   return _cache;
    if (_promise) return _promise;

    if (!isSheetConfigured()) {
      console.info("[RLL] Sheet not configured — using demo data.");
      _cache = buildFromDemo();
      return _cache;
    }

    _promise = (async () => {
      try {
        const [cells, history, rawPlayers] = await Promise.all([
          fetchAllCells(),
          fetchHistory(),
          fetchPlayers(),
        ]);
        _cache = buildFromSheet(cells, history, rawPlayers);
        return _cache;
      } catch (err) {
        console.warn("[RLL] Sheet error — falling back to demo data.", err);
        _cache = buildFromDemo();
        return _cache;
      } finally {
        _promise = null;
      }
    })();
    return _promise;
  }

  /* ── BUILD FROM SHEET ─────────────────────────────── */
  function buildFromSheet(cells, history, rawPlayers) {
    const n = v => parseInt(v, 10) || 0;

    const sylvansGoalsFor     = n(cells.SYLVANS_GOALS_FOR);
    const cpfcGoalsFor        = n(cells.CPFC_GOALS_FOR);
    const sylvansGoalsAgainst = n(cells.SYLVANS_GOALS_AGAINST);
    const cpfcGoalsAgainst    = n(cells.CPFC_GOALS_AGAINST);

    const players = computePlayerStats(rawPlayers, history);

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
      announcement:   (cells.ANNOUNCEMENT || "").trim(),
      history,
      latestMatch: history[0] || null,
      players,
      sylvansPlayers: players.filter(p => p.team === RLL_CONFIG.TEAMS.SYLVANS.key),
      cpfcPlayers:    players.filter(p => p.team === RLL_CONFIG.TEAMS.CPFC.key),
      fromDemo: false,
    };
  }

  /* ── BUILD FROM DEMO ──────────────────────────────── */
  function buildFromDemo() {
    const D = RLL_CONFIG.DEMO;
    const history = [...D.history];
    const players = computePlayerStats(D.players, history);

    return {
      ...D,
      history,
      totalGoals: D.sylvansGoalsFor + D.cpfcGoalsFor,
      latestMatch: history[0] || null,
      players,
      sylvansPlayers: players.filter(p => p.team === RLL_CONFIG.TEAMS.SYLVANS.key),
      cpfcPlayers:    players.filter(p => p.team === RLL_CONFIG.TEAMS.CPFC.key),
      fromDemo: true,
    };
  }

  /* ── PLAYER STATS ENGINE ──────────────────────────── */
  function computePlayerStats(players, history) {
    // Count goals and MOTM awards from match history
    const goalCounts = {};
    const motmCounts = {};

    history.forEach(match => {
      // Goals from scorers column
      (match.scorers || []).forEach(name => {
        if (name) goalCounts[name] = (goalCounts[name] || 0) + 1;
      });
      // MOTM awards
      const m = match.motm;
      if (m && m !== "—") motmCounts[m] = (motmCounts[m] || 0) + 1;
    });

    // Attach stats to registered players
    const enriched = players.map(p => ({
      ...p,
      goals:      goalCounts[p.name] || 0,
      motmAwards: motmCounts[p.name] || 0,
    }));

    // Also add any scorer names NOT in the player list (data entry flexibility)
    const registeredNames = new Set(players.map(p => p.name));
    Object.keys(goalCounts).forEach(name => {
      if (!registeredNames.has(name)) {
        enriched.push({
          name,
          team:       "Unknown",
          number:     "?",
          goals:      goalCounts[name] || 0,
          motmAwards: motmCounts[name] || 0,
        });
      }
    });
    // Same for MOTM-only players
    Object.keys(motmCounts).forEach(name => {
      if (!registeredNames.has(name) && !goalCounts[name]) {
        enriched.push({
          name,
          team:       "Unknown",
          number:     "?",
          goals:      0,
          motmAwards: motmCounts[name],
        });
      }
    });

    return enriched;
  }

  /* ── PUBLIC HELPERS ───────────────────────────────── */

  function winRate(wins, played) {
    if (!played) return "0.0";
    return ((wins / played) * 100).toFixed(1);
  }

  function matchResult(match, team) {
    const s = match.sylvans, c = match.cpfc;
    if (s === c) return "D";
    if (team === "sylvans") return s > c ? "W" : "L";
    return c > s ? "W" : "L";
  }

  function recentForm(history, team, n = 5) {
    return history.slice(0, n).map(m => matchResult(m, team));
  }

  /** Top N players sorted by goals, then MOTM as tiebreaker */
  function topScorers(players, n = 5) {
    return [...players]
      .filter(p => p.goals > 0)
      .sort((a, b) => b.goals - a.goals || b.motmAwards - a.motmAwards)
      .slice(0, n);
  }

  /** Top N players sorted by MOTM awards */
  function topMOTM(players, n = 5) {
    return [...players]
      .filter(p => p.motmAwards > 0)
      .sort((a, b) => b.motmAwards - a.motmAwards || b.goals - a.goals)
      .slice(0, n);
  }

  return { load, winRate, matchResult, recentForm, topScorers, topMOTM };
})();
