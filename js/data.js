/* =====================================================
   ROCKMOUNT LUNCHTIME LEAGUE — data.js
===================================================== */

const RLLData = (() => {

  let _cache = null, _promise = null;

  /* ── FETCH ───────────────────────────────────────── */
  async function fetchRange(range) {
    const res  = await fetch(sheetUrlDirect(range));
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    const text = await res.text();
    return text.trim().split("\n").map(parseCSVRow);
  }

  async function fetchCell(ref) {
    try { const r = await fetchRange(ref); return r[0]?.[0] ?? ""; }
    catch { return null; }
  }

  async function fetchAllCells() {
    const entries = Object.entries(RLL_CONFIG.CELLS);
    const values  = await Promise.all(entries.map(([, ref]) => fetchCell(ref)));
    const out = {};
    entries.forEach(([k], i) => { out[k] = values[i]; });
    return out;
  }

  async function fetchHistory() {
    const rows = await fetchRange(RLL_CONFIG.HISTORY_RANGE);
    const C = RLL_CONFIG.HISTORY_COLS;
    return rows
      .filter(r => r[C.DATE] && r[C.SYLVANS_SCORE] !== "" && r[C.CPFC_SCORE] !== "")
      .map(r => ({
        date:    r[C.DATE] || "",
        sylvans: parseInt(r[C.SYLVANS_SCORE], 10) || 0,
        cpfc:    parseInt(r[C.CPFC_SCORE],    10) || 0,
        motm:    r[C.MOTM] || "—",
        scorers: C.SCORERS != null ? parseScorers(r[C.SCORERS] || "") : [],
      }))
      .reverse();
  }

  async function fetchPlayers() {
    const rows = await fetchRange(RLL_CONFIG.PLAYERS_RANGE);
    const C = RLL_CONFIG.PLAYERS_COLS;
    return rows
      .filter(r => r[C.NAME] && r[C.TEAM])
      .map(r => ({
        name:   r[C.NAME].trim(),
        team:   r[C.TEAM].trim(),
        number: (r[C.NUMBER] || "").trim(),
        bio:    C.BIO   != null ? (r[C.BIO]   || "").trim() : "",
        image:  C.IMAGE != null ? (r[C.IMAGE] || "").trim() : "",
      }));
  }

  async function fetchAnnouncements() {
    const rows = await fetchRange(RLL_CONFIG.ANNOUNCEMENTS_RANGE);
    const C = RLL_CONFIG.ANNOUNCEMENTS_COLS;
    return rows
      .filter(r => r[C.MESSAGE] && r[C.MESSAGE].trim())
      .map(r => ({ date: r[C.DATE] || "", message: r[C.MESSAGE].trim() }))
      .reverse();
  }

  /* ── CHAT ────────────────────────────────────────── */
  async function fetchChat(type) {
    if (!isAppsScriptConfigured()) return [];
    try {
      const res  = await fetch(`${RLL_CONFIG.APPS_SCRIPT_URL}?type=${type}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }

  async function postMessage(type, name, msg) {
    if (!isAppsScriptConfigured()) throw new Error("Apps Script not configured");
    const res  = await fetch(RLL_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      body:   JSON.stringify({ type, name: name.trim(), msg: msg.trim() }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return true;
  }

  /* ── MASTER LOAD ─────────────────────────────────── */
  async function load() {
    if (_cache)   return _cache;
    if (_promise) return _promise;

    if (!isSheetConfigured()) {
      _cache = buildFromDemo();
      return _cache;
    }

    _promise = (async () => {
      try {
        const [cells, history, rawPlayers, announcements] = await Promise.all([
          fetchAllCells(),
          fetchHistory(),
          fetchPlayers(),
          fetchAnnouncements().catch(() => []),
        ]);
        _cache = buildFromSheet(cells, history, rawPlayers, announcements);
        return _cache;
      } catch (err) {
        console.warn("[RLL] Sheet error — using demo data.", err);
        _cache = buildFromDemo();
        return _cache;
      } finally { _promise = null; }
    })();
    return _promise;
  }

  /* ── BUILD ───────────────────────────────────────── */
  function buildFromSheet(cells, history, rawPlayers, announcements) {
    const n = v => parseInt(v, 10) || 0;
    const gf = n(cells.SYLVANS_GOALS_FOR), cf = n(cells.CPFC_GOALS_FOR);
    const players = computePlayerStats(rawPlayers, history);
    return {
      sylvansPoints: n(cells.SYLVANS_POINTS), cpfcPoints: n(cells.CPFC_POINTS),
      sylvansWins:   n(cells.SYLVANS_WINS),   cpfcWins:   n(cells.CPFC_WINS),
      sylvansDraws:  n(cells.SYLVANS_DRAWS),  cpfcDraws:  n(cells.CPFC_DRAWS),
      sylvansLosses: n(cells.SYLVANS_LOSSES), cpfcLosses: n(cells.CPFC_LOSSES),
      sylvansGoalsFor: gf, cpfcGoalsFor: cf,
      sylvansGoalsAgainst: n(cells.SYLVANS_GOALS_AGAINST),
      cpfcGoalsAgainst:    n(cells.CPFC_GOALS_AGAINST),
      sylvansPlayed: n(cells.SYLVANS_PLAYED), cpfcPlayed: n(cells.CPFC_PLAYED),
      totalGoals: gf + cf,
      announcement:  (cells.ANNOUNCEMENT || "").trim(),
      announcements, history,
      latestMatch:   history[0] || null,
      players,
      sylvansPlayers: players.filter(p => p.team === RLL_CONFIG.TEAMS.SYLVANS.key),
      cpfcPlayers:    players.filter(p => p.team === RLL_CONFIG.TEAMS.CPFC.key),
      fromDemo: false,
    };
  }

  function buildFromDemo() {
    const D = RLL_CONFIG.DEMO;
    const history = [...D.history];
    const players = computePlayerStats(D.players, history);
    return {
      ...D, history, announcements: D.announcements || [],
      totalGoals: D.sylvansGoalsFor + D.cpfcGoalsFor,
      announcement: "", latestMatch: history[0] || null,
      players,
      sylvansPlayers: players.filter(p => p.team === RLL_CONFIG.TEAMS.SYLVANS.key),
      cpfcPlayers:    players.filter(p => p.team === RLL_CONFIG.TEAMS.CPFC.key),
      fromDemo: true,
    };
  }

  function computePlayerStats(players, history) {
    const goals = {}, motm = {};
    history.forEach(m => {
      (m.scorers || []).forEach(n => { if (n) goals[n] = (goals[n] || 0) + 1; });
      if (m.motm && m.motm !== "—") motm[m.motm] = (motm[m.motm] || 0) + 1;
    });
    const enriched  = players.map(p => ({ ...p, goals: goals[p.name] || 0, motmAwards: motm[p.name] || 0 }));
    const registered = new Set(players.map(p => p.name));
    [...Object.keys(goals), ...Object.keys(motm)].forEach(name => {
      if (!registered.has(name)) {
        enriched.push({ name, team: "Unknown", number: "?", bio: "", image: "", goals: goals[name] || 0, motmAwards: motm[name] || 0 });
        registered.add(name);
      }
    });
    return enriched;
  }

  /* ── PUBLIC HELPERS ──────────────────────────────── */
  function winRate(wins, played) { return !played ? "0.0" : ((wins/played)*100).toFixed(1); }
  function matchResult(m, team) {
    if (m.sylvans === m.cpfc) return "D";
    if (team === "sylvans") return m.sylvans > m.cpfc ? "W" : "L";
    return m.cpfc > m.sylvans ? "W" : "L";
  }
  function recentForm(history, team, n=5) { return history.slice(0,n).map(m => matchResult(m,team)); }
  function topScorers(players, n=5) {
    return [...players].filter(p=>p.goals>0).sort((a,b)=>b.goals-a.goals||b.motmAwards-a.motmAwards).slice(0,n);
  }
  function topMOTM(players, n=5) {
    return [...players].filter(p=>p.motmAwards>0).sort((a,b)=>b.motmAwards-a.motmAwards||b.goals-a.goals).slice(0,n);
  }

  return { load, fetchChat, postMessage, winRate, matchResult, recentForm, topScorers, topMOTM };
})();
