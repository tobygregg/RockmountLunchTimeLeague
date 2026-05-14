/* =====================================================
   ROCKMOUNT LUNCHTIME LEAGUE — main.js
===================================================== */

/* ── PAGE TRANSITION ─────────────────────────────── */
const PageTransition = (() => {
  const overlay = document.querySelector(".page-transition");
  function init() {
    if (!overlay) return;
    overlay.classList.add("out");
    document.querySelectorAll("a[data-transition]").forEach(link => {
      link.addEventListener("click", e => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("http")) return;
        e.preventDefault();
        overlay.classList.remove("out");
        overlay.classList.add("in");
        setTimeout(() => { window.location.href = href; }, 480);
      });
    });
  }
  return { init };
})();

/* ── NAV ─────────────────────────────────────────── */
const Nav = (() => {
  function init() {
    const nav    = document.querySelector(".nav");
    const toggle = document.querySelector(".nav__toggle");
    const links  = document.querySelector(".nav__links");
    if (!nav) return;
    window.addEventListener("scroll", () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    }, { passive: true });
    toggle?.addEventListener("click", () => {
      toggle.classList.toggle("open");
      links?.classList.toggle("open");
    });
    links?.querySelectorAll(".nav__link").forEach(l => {
      l.addEventListener("click", () => {
        toggle?.classList.remove("open");
        links.classList.remove("open");
      });
    });
    const current = window.location.pathname.split("/").pop() || "index.html";
    links?.querySelectorAll(".nav__link").forEach(link => {
      const href = link.getAttribute("href");
      if (href === current || (current === "" && href === "index.html")) link.classList.add("active");
    });
  }
  return { init };
})();

/* ── SCROLL REVEAL ───────────────────────────────── */
const Reveal = (() => {
  let observer;
  function init() {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = [...entry.target.parentElement.querySelectorAll(".reveal:not(.visible)")];
          const idx = siblings.indexOf(entry.target);
          setTimeout(() => entry.target.classList.add("visible"), idx * 55);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
  }
  function observe(el) { observer?.observe(el); }
  return { init, observe };
})();

/* ── ANIMATED COUNTER ────────────────────────────── */
const Counter = (() => {
  function animateTo(el, target, duration=1200, suffix="") {
    const start = performance.now();
    const from  = parseInt(el.dataset.from || "0", 10);
    function step(now) {
      const p    = Math.min((now - start) / duration, 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(from + (target - from) * ease) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function initAll() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el  = entry.target;
          animateTo(el, parseInt(el.dataset.count, 10), parseInt(el.dataset.duration||"1200",10), el.dataset.suffix||"");
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll("[data-count]").forEach(c => obs.observe(c));
  }
  return { initAll, animateTo };
})();

/* ── COMPARISON BARS ─────────────────────────────── */
const Bars = (() => {
  function init() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".comparison-bar__fill").forEach(bar => {
            bar.style.width = (bar.dataset.pct || "0") + "%";
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll(".comparison-bar").forEach(b => obs.observe(b));
  }
  return { init };
})();

/* ── SCORE FLIP ──────────────────────────────────── */
function animateScoreFlip(el, finalValue) {
  let iter = 0;
  const iv = setInterval(() => {
    el.textContent = Math.floor(Math.random() * 10);
    if (++iter > 10) { el.textContent = finalValue; clearInterval(iv); }
  }, 50);
}

/* ── PARTICLES ───────────────────────────────────── */
function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles = [];
  function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  function Particle() {
    this.reset = function() {
      this.x = Math.random()*w; this.y = Math.random()*h;
      this.size = Math.random()*1.5+0.3;
      this.vx = (Math.random()-.5)*.25; this.vy = (Math.random()-.5)*.25;
      this.alpha = Math.random()*.35+.05;
    };
    this.update = function() {
      this.x += this.vx; this.y += this.vy;
      if (this.x<0||this.x>w||this.y<0||this.y>h) this.reset();
    };
    this.reset();
  }
  function loop() {
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => {
      p.update();
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`; ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  resize();
  particles = Array.from({length:60},()=>new Particle());
  window.addEventListener("resize", resize, {passive:true});
  loop();
}

/* ── DEMO BADGE ──────────────────────────────────── */
function showDemoBadge() {
  const b = document.getElementById("demo-badge");
  if (b) b.style.display = "flex";
}

/* =====================================================
   PLAYER POPUP
   Attach to any element with data-player="Name"
   Will look up the player from window.__RLL_PLAYERS__
===================================================== */
const PlayerPopup = (() => {
  let popup    = null;
  let current  = null;
  let hideTimer = null;

  function getPlayers() { return window.__RLL_PLAYERS__ || []; }

  function findPlayer(name) {
    const nl = name.toLowerCase().trim();
    return getPlayers().find(p => p.name.toLowerCase().trim() === nl) || null;
  }

  function teamColor(team) {
    if (team === RLL_CONFIG.TEAMS.SYLVANS.key) return "var(--sylvans)";
    if (team === RLL_CONFIG.TEAMS.CPFC.key)    return "var(--cpfc)";
    return "rgba(255,255,255,0.5)";
  }
  function teamGlow(team) {
    if (team === RLL_CONFIG.TEAMS.SYLVANS.key) return "var(--sylvans-glow)";
    if (team === RLL_CONFIG.TEAMS.CPFC.key)    return "var(--cpfc-glow)";
    return "transparent";
  }
  function teamName(team) {
    if (team === RLL_CONFIG.TEAMS.SYLVANS.key) return RLL_CONFIG.TEAMS.SYLVANS.name;
    if (team === RLL_CONFIG.TEAMS.CPFC.key)    return RLL_CONFIG.TEAMS.CPFC.name;
    return team;
  }

  function build(player) {
    const col  = teamColor(player.team);
    const glow = teamGlow(player.team);
    const tn   = teamName(player.team);

    const imgHtml = player.image
      ? `<img class="pp__img" src="${player.image}" alt="${player.name}"
              onerror="this.replaceWith(buildAvatarFallback('${player.name[0]}','${player.team}'))"/>`
      : buildAvatarFallback(player.name[0], player.team).outerHTML;

    const stats = [];
    if (player.goals      > 0) stats.push(`⚽ ${player.goals} goal${player.goals!==1?"s":""}`);
    if (player.motmAwards > 0) stats.push(`⭐ ${player.motmAwards} MOTM`);

    return `
      <div class="pp__inner">
        <button class="pp__close" id="pp-close" aria-label="Close">✕</button>
        <div class="pp__left">
          ${imgHtml}
          <div class="pp__number" style="color:${col};text-shadow:0 0 20px ${glow}">#${player.number||"—"}</div>
        </div>
        <div class="pp__right">
          <div class="pp__team" style="color:${col}">${tn}</div>
          <div class="pp__name">${player.name}</div>
          ${player.bio ? `<div class="pp__bio">${player.bio}</div>` : ""}
          ${stats.length ? `<div class="pp__stats">${stats.map(s=>`<span class="pp__stat">${s}</span>`).join("")}</div>` : ""}
        </div>
      </div>
    `;
  }

  function buildAvatarFallback(letter, team) {
    const col = teamColor(team);
    const div = document.createElement("div");
    div.className = "pp__avatar-fallback";
    div.style.cssText = `background:${col === "var(--sylvans)" ? "rgba(230,48,48,0.15)" : col === "var(--cpfc)" ? "rgba(26,109,212,0.15)" : "rgba(255,255,255,0.08)"};color:${col};border:2px solid ${col}`;
    div.textContent = (letter || "?").toUpperCase();
    return div;
  }

  function show(triggerEl, playerName) {
    const player = findPlayer(playerName);
    if (!player) return;
    if (current === playerName && popup) return;

    clearTimeout(hideTimer);
    hide(true); // instant hide previous

    current = playerName;
    popup   = document.createElement("div");
    popup.className = "player-popup";
    popup.innerHTML = build(player);
    document.body.appendChild(popup);

    // Position relative to trigger
    const rect = triggerEl.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const pw = 320, gap = 10;

    let top  = rect.bottom + scrollY + gap;
    let left = rect.left   + scrollX + rect.width/2 - pw/2;

    // Clamp horizontally
    const margin = 12;
    if (left < margin) left = margin;
    if (left + pw > window.innerWidth - margin) left = window.innerWidth - pw - margin;

    // Flip above if too close to bottom
    if (rect.bottom + 200 > window.innerHeight) {
      top = rect.top + scrollY - gap;
      popup.classList.add("pp--above");
    }

    popup.style.cssText = `top:${top}px;left:${left}px;width:${pw}px`;

    // Close button
    popup.querySelector("#pp-close").addEventListener("click", () => hide());

    // Animate in
    requestAnimationFrame(() => { popup.classList.add("pp--visible"); });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener("click", outsideClick, { once: false });
    }, 10);
  }

  function outsideClick(e) {
    if (popup && !popup.contains(e.target) && !e.target.closest("[data-player]")) {
      hide();
      document.removeEventListener("click", outsideClick);
    }
  }

  function hide(instant = false) {
    if (!popup) return;
    document.removeEventListener("click", outsideClick);
    if (instant) {
      popup.remove(); popup = null; current = null; return;
    }
    popup.classList.remove("pp--visible");
    const p = popup;
    hideTimer = setTimeout(() => { p.remove(); if (popup === p) { popup = null; current = null; } }, 280);
  }

  /* Attach to all [data-player] elements in a container (or whole doc) */
  function attachAll(root = document) {
    root.querySelectorAll("[data-player]").forEach(el => {
      if (el.dataset.ppBound) return;
      el.dataset.ppBound = "1";
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        show(el, el.dataset.player);
      });
    });
  }

  return { show, hide, attachAll, findPlayer, teamColor };
})();

/* =====================================================
   HTML BUILDERS (shared across all pages)
===================================================== */

/* ── Wrap player names as clickable spans ── */
function linkPlayerName(name) {
  if (!name || name === "—") return name;
  const player = PlayerPopup.findPlayer(name);
  const col    = player ? PlayerPopup.teamColor(player.team) : null;
  const style  = col ? `color:${col};font-weight:700` : "";
  return `<span class="player-link" data-player="${name}" style="${style}">${name}</span>`;
}

/* ── Match card ── */
function buildMatchCard(match) {
  if (!match) return '<p class="text-muted" style="padding:20px">No match data yet.</p>';
  const sylWin  = match.sylvans > match.cpfc;
  const cpfcWin = match.cpfc > match.sylvans;
  const sylStyle  = sylWin  ? `color:var(--sylvans);text-shadow:0 0 30px var(--sylvans-glow)` : "";
  const cpfcStyle = cpfcWin ? `color:var(--cpfc);text-shadow:0 0 30px var(--cpfc-glow)` : "";
  return `
    <div class="match-card">
      <div class="match-card__date">
        <span>Latest Match</span>
        ${match.date ? `<span>${match.date}</span>` : ""}
      </div>
      <div class="match-card__body">
        <div class="match-card__team"><span class="match-card__team-name" style="${sylStyle}">${RLL_CONFIG.TEAMS.SYLVANS.shortName}</span></div>
        <div class="match-card__score-block">
          <span class="match-card__score" style="${sylStyle}">${match.sylvans}</span>
          <span class="match-card__score-sep">—</span>
          <span class="match-card__score" style="${cpfcStyle}">${match.cpfc}</span>
        </div>
        <div class="match-card__team"><span class="match-card__team-name" style="${cpfcStyle}">${RLL_CONFIG.TEAMS.CPFC.shortName}</span></div>
      </div>
      ${match.motm && match.motm !== "—" ? `
      <div class="match-card__motm">
        <span class="match-card__motm-label">⭐ Man of the Match</span>
        <span class="match-card__motm-name">${linkPlayerName(match.motm)}</span>
      </div>` : ""}
    </div>`;
}

/* ── History rows ── */
function buildHistoryRows(history) {
  if (!history || !history.length)
    return `<div class="loading" style="border:1px solid var(--border);border-radius:8px">No matches played yet</div>`;

  return history.map((match, i) => {
    const result   = match.sylvans > match.cpfc ? "sylvans" : match.cpfc > match.sylvans ? "cpfc" : "draw";
    const sylStyle = result === "sylvans" ? `color:var(--sylvans)` : "";
    const cpStyle  = result === "cpfc"    ? `color:var(--cpfc)` : "";
    const isLatest = i === 0;
    const resultLabel = result === "sylvans"
      ? `<span class="history-match__result text-sylvans">Sylvans Win</span>`
      : result === "cpfc"
      ? `<span class="history-match__result text-cpfc">CP FC Win</span>`
      : `<span class="history-match__result text-muted">Draw</span>`;

    let scorerHtml = "";
    if (match.scorers && match.scorers.length > 0) {
      const counts = {};
      match.scorers.forEach(n => counts[n] = (counts[n]||0)+1);
      scorerHtml = `<div class="history-match__scorers">
        ${Object.entries(counts).map(([name,count]) =>
          `<span class="scorer-chip">${linkPlayerName(name)}${count>1?` ×${count}`:""}</span>`
        ).join("")}
      </div>`;
    }

    return `
      <div class="history-match reveal" style="transition-delay:${i*40}ms">
        <div class="history-match__team history-match__team--home" style="${sylStyle}">
          ${RLL_CONFIG.TEAMS.SYLVANS.shortName}
          ${isLatest ? `<span class="latest-badge">Latest</span>` : ""}
        </div>
        <div class="history-match__score">
          <span class="history-match__score-num" style="${sylStyle}">${match.sylvans}</span>
          <span class="history-match__score-sep">—</span>
          <span class="history-match__score-num" style="${cpStyle}">${match.cpfc}</span>
        </div>
        <div class="history-match__team history-match__team--away" style="${cpStyle}">${RLL_CONFIG.TEAMS.CPFC.shortName}</div>
        <div class="history-match__meta">
          <span class="history-match__date">📅 ${match.date}</span>
          ${match.motm && match.motm!=="—" ? `<span class="history-match__motm">⭐ ${linkPlayerName(match.motm)}</span>` : ""}
          ${resultLabel}
        </div>
        ${scorerHtml}
      </div>`;
  }).join("");
}

/* ── Comparison bar ── */
function buildComparisonBar(data, labelA, valueA, labelB, valueB) {
  const total = valueA + valueB;
  const pctA  = total ? Math.round((valueA/total)*100) : 50;
  return `
    <div class="comparison-bar">
      <div class="comparison-bar__row comparison-bar__row--sylvans reveal">
        <span class="comparison-bar__team">${labelA}</span>
        <div class="comparison-bar__track"><div class="comparison-bar__fill" data-pct="${pctA}"></div></div>
        <span class="comparison-bar__value" data-count="${valueA}" data-duration="1100">${valueA}</span>
      </div>
      <div class="comparison-bar__row comparison-bar__row--cpfc reveal">
        <span class="comparison-bar__team">${labelB}</span>
        <div class="comparison-bar__track"><div class="comparison-bar__fill" data-pct="${100-pctA}"></div></div>
        <span class="comparison-bar__value" data-count="${valueB}" data-duration="1100">${valueB}</span>
      </div>
    </div>`;
}

/* ── Form guide ── */
function buildFormGuide(history, team) {
  const form = (history||[]).slice(0,5).map(m => {
    const s=m.sylvans,c=m.cpfc;
    if(s===c)return"D";
    if(team==="sylvans")return s>c?"W":"L";
    return c>s?"W":"L";
  });
  if (!form.length) return "";
  return `<div class="form-guide">${form.map(r=>`<div class="form-badge form-badge--${r}">${r}</div>`).join("")}</div>`;
}

/* ── MOTM leaderboard ── */
function buildMOTMLeaderboard(history) {
  const counts = {};
  history.forEach(m => { if (m.motm && m.motm!=="—") counts[m.motm]=(counts[m.motm]||0)+1; });
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  if (!sorted.length) return '<p class="text-muted">No data yet.</p>';
  const max = sorted[0][1];
  return `<div class="motm-list">
    ${sorted.map(([name,count],i)=>`
      <div class="motm-row reveal" style="transition-delay:${i*40}ms">
        <span class="motm-rank">#${i+1}</span>
        <span class="motm-name">${linkPlayerName(name)}</span>
        <div class="motm-bar-wrap"><div class="motm-bar-track">
          <div class="motm-bar-fill comparison-bar__fill" data-pct="${Math.round((count/max)*100)}"></div>
        </div></div>
        <span class="motm-count">${count}× ⭐</span>
      </div>`).join("")}
  </div>`;
}

/* ── Team sheet (squad grid) ── */
function buildTeamSheet(players, teamKey, accentColor, glowColor) {
  if (!players || !players.length)
    return '<p class="text-muted" style="padding:20px">No squad data yet.</p>';
  const sorted = [...players].sort((a,b) => {
    const na=parseInt(a.number,10), nb=parseInt(b.number,10);
    if(isNaN(na)&&isNaN(nb))return 0; if(isNaN(na))return 1; if(isNaN(nb))return-1;
    return na-nb;
  });
  return `<div class="squad-grid">
    ${sorted.map((p,i)=>`
      <div class="squad-card reveal" style="transition-delay:${i*40}ms">
        <div class="squad-card__number" style="color:${accentColor};text-shadow:0 0 30px ${glowColor}">${p.number||"—"}</div>
        <div class="squad-card__info">
          <div class="squad-card__name player-link" data-player="${p.name}" style="color:${accentColor}">${p.name}</div>
          <div class="squad-card__badges">
            ${p.goals>0?`<span class="squad-badge squad-badge--goals">⚽ ${p.goals} goal${p.goals!==1?"s":""}</span>`:""}
            ${p.motmAwards>0?`<span class="squad-badge squad-badge--motm">⭐ ${p.motmAwards} MOTM</span>`:""}
            ${p.goals===0&&p.motmAwards===0?`<span class="squad-badge squad-badge--none">No stats yet</span>`:""}
          </div>
        </div>
        <div class="squad-card__bar" style="background:${accentColor};opacity:0.06"></div>
      </div>`).join("")}
  </div>`;
}

/* ── Top scorer card ── */
function buildTopScorerCard(players, accentColor, glowColor) {
  const top = RLLData.topScorers(players, 3);
  if (!top.length) return '<p class="text-muted" style="padding:20px">No scorer data yet.</p>';
  const [first, ...rest] = top;
  return `
    <div class="top-scorer-card reveal">
      <div class="top-scorer-card__crown">👑 Top Scorer</div>
      <div class="top-scorer-card__hero">
        <div class="top-scorer-card__goals" style="color:${accentColor};text-shadow:0 0 40px ${glowColor}">
          <span data-count="${first.goals}" data-duration="1000">${first.goals}</span>
        </div>
        <div class="top-scorer-card__info">
          <div class="top-scorer-card__name">${linkPlayerName(first.name)}</div>
          <div class="top-scorer-card__sub">⚽ ${first.goals} goal${first.goals!==1?"s":""}${first.motmAwards?` · ⭐ ${first.motmAwards} MOTM`:""}</div>
        </div>
      </div>
      ${rest.length?`<div class="top-scorer-card__runners">${rest.map((p,i)=>`
        <div class="top-scorer-card__runner">
          <span class="top-scorer-card__runner-pos">#${i+2}</span>
          <span class="top-scorer-card__runner-name">${linkPlayerName(p.name)}</span>
          <span class="top-scorer-card__runner-goals" style="color:${accentColor}">${p.goals}</span>
        </div>`).join("")}</div>`:""}
    </div>`;
}

/* ── Top MOTM card ── */
function buildTopMOTMCard(players, accentColor, glowColor) {
  const top = RLLData.topMOTM(players, 3);
  if (!top.length) return '<p class="text-muted" style="padding:20px">No MOTM data yet.</p>';
  const [first, ...rest] = top;
  return `
    <div class="top-scorer-card top-scorer-card--motm reveal">
      <div class="top-scorer-card__crown">⭐ Top MOTM</div>
      <div class="top-scorer-card__hero">
        <div class="top-scorer-card__goals" style="color:var(--gold);text-shadow:0 0 40px var(--gold-glow)">
          <span data-count="${first.motmAwards}" data-duration="1000">${first.motmAwards}</span>
        </div>
        <div class="top-scorer-card__info">
          <div class="top-scorer-card__name">${linkPlayerName(first.name)}</div>
          <div class="top-scorer-card__sub">⭐ ${first.motmAwards} award${first.motmAwards!==1?"s":""}${first.goals?` · ⚽ ${first.goals} goals`:""}</div>
        </div>
      </div>
      ${rest.length?`<div class="top-scorer-card__runners">${rest.map((p,i)=>`
        <div class="top-scorer-card__runner">
          <span class="top-scorer-card__runner-pos">#${i+2}</span>
          <span class="top-scorer-card__runner-name">${linkPlayerName(p.name)}</span>
          <span class="top-scorer-card__runner-goals" style="color:var(--gold)">${p.motmAwards}</span>
        </div>`).join("")}</div>`:""}
    </div>`;
}

/* ── INIT ────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  PageTransition.init();
  Nav.init();
  Reveal.init();
  Counter.initAll();
  Bars.init();
});
