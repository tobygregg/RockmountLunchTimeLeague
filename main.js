/* =====================================================
   ROCKMOUNT LUNCHTIME LEAGUE — main.js
   Core animations, nav, page transitions, helpers.
===================================================== */

/* ── PAGE TRANSITION ─────────────────────────────── */
const PageTransition = (() => {
  const overlay = document.querySelector(".page-transition");

  function init() {
    if (!overlay) return;
    // Slide up on load
    overlay.classList.add("out");

    // Intercept nav clicks
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

    // Scroll class
    window.addEventListener("scroll", () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    }, { passive: true });

    // Mobile toggle
    toggle?.addEventListener("click", () => {
      toggle.classList.toggle("open");
      links?.classList.toggle("open");
    });

    // Close on nav link click
    links?.querySelectorAll(".nav__link").forEach(l => {
      l.addEventListener("click", () => {
        toggle?.classList.remove("open");
        links.classList.remove("open");
      });
    });

    // Active link
    const current = window.location.pathname.split("/").pop() || "index.html";
    links?.querySelectorAll(".nav__link").forEach(link => {
      const href = link.getAttribute("href");
      if (href === current || (current === "" && href === "index.html")) {
        link.classList.add("active");
      }
    });
  }

  return { init };
})();

/* ── SCROLL REVEAL ───────────────────────────────── */
const Reveal = (() => {
  let observer;

  function init() {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Slight stagger for sibling reveals
          const siblings = [...entry.target.parentElement.querySelectorAll(".reveal:not(.visible)")];
          const idx = siblings.indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, idx * 60);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
  }

  function observe(el) {
    observer?.observe(el);
  }

  return { init, observe };
})();

/* ── ANIMATED COUNTER ────────────────────────────── */
const Counter = (() => {
  function animateTo(el, target, duration = 1200, suffix = "") {
    const start = performance.now();
    const startVal = parseInt(el.dataset.from || "0", 10);

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const value = Math.round(startVal + (target - startVal) * ease);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initAll() {
    const counters = document.querySelectorAll("[data-count]");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el  = entry.target;
          const val = parseInt(el.dataset.count, 10);
          const dur = parseInt(el.dataset.duration || "1200", 10);
          const sfx = el.dataset.suffix || "";
          animateTo(el, val, dur, sfx);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => obs.observe(c));
  }

  return { initAll, animateTo };
})();

/* ── COMPARISON BARS ─────────────────────────────── */
const Bars = (() => {
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".comparison-bar__fill").forEach(bar => {
            const pct = bar.dataset.pct || "0";
            bar.style.width = pct + "%";
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll(".comparison-bar").forEach(b => observer.observe(b));
  }

  return { init };
})();

/* ── SCORE FLIP ANIMATION ────────────────────────── */
function animateScoreFlip(el, finalValue) {
  const chars = "0123456789";
  let iter = 0;
  const interval = setInterval(() => {
    el.textContent = chars[Math.floor(Math.random() * chars.length)];
    iter++;
    if (iter > 10) {
      el.textContent = finalValue;
      clearInterval(interval);
    }
  }, 50);
}

/* ── MATCH CARD BUILDER ──────────────────────────── */
function buildMatchCard(match) {
  if (!match) return '<p class="text-muted" style="padding:20px">No match data yet.</p>';

  const sylWin  = match.sylvans > match.cpfc;
  const cpfcWin = match.cpfc > match.sylvans;
  const draw    = match.sylvans === match.cpfc;

  const sylStyle  = sylWin  ? `color:var(--sylvans);text-shadow:0 0 30px var(--sylvans-glow)` : "";
  const cpfcStyle = cpfcWin ? `color:var(--cpfc);text-shadow:0 0 30px var(--cpfc-glow)` : "";

  return `
    <div class="match-card">
      <div class="match-card__date">
        <span>Latest Match</span>
        ${match.date ? `<span style="margin-left:auto">${match.date}</span>` : ""}
      </div>
      <div class="match-card__body">
        <div class="match-card__team">
          <span class="match-card__team-name" style="${sylStyle}">${RLL_CONFIG.TEAMS.SYLVANS.shortName}</span>
        </div>
        <div class="match-card__score-block">
          <span class="match-card__score js-score-syl" style="${sylStyle}">${match.sylvans}</span>
          <span class="match-card__score-sep">—</span>
          <span class="match-card__score js-score-cpfc" style="${cpfcStyle}">${match.cpfc}</span>
        </div>
        <div class="match-card__team">
          <span class="match-card__team-name" style="${cpfcStyle}">${RLL_CONFIG.TEAMS.CPFC.shortName}</span>
        </div>
      </div>
      ${match.motm !== "—" ? `
      <div class="match-card__motm">
        <span class="match-card__motm-label">⭐ Man of the Match</span>
        <span class="match-card__motm-name">${match.motm}</span>
      </div>` : ""}
    </div>
  `;
}

/* ── HISTORY TABLE BUILDER ───────────────────────── */
function buildHistoryRows(history) {
  if (!history || history.length === 0) {
    return `<div class="loading" style="border:1px solid var(--border);border-radius:8px">No matches played yet</div>`;
  }

  return history.map((match, i) => {
    const result = match.sylvans > match.cpfc ? "sylvans"
                 : match.cpfc > match.sylvans ? "cpfc"
                 : "draw";

    const sylStyle  = result === "sylvans" ? `color:var(--sylvans)` : "";
    const cpfcStyle = result === "cpfc"    ? `color:var(--cpfc)`    : "";
    const drawStyle = result === "draw"    ? `color:var(--text-muted)` : "";

    const resultLabel = result === "sylvans" ? `<span class="history-match__result text-sylvans">Sylvans Win</span>`
                      : result === "cpfc"    ? `<span class="history-match__result text-cpfc">CP FC Win</span>`
                      : `<span class="history-match__result text-muted">Draw</span>`;

    const isLatest = i === 0;

    return `
      <div class="history-match reveal" style="transition-delay:${i * 45}ms">
        <div class="history-match__team history-match__team--home" style="${sylStyle}">
          ${RLL_CONFIG.TEAMS.SYLVANS.shortName}
          ${isLatest ? '<span style="font-size:0.65rem;font-weight:700;letter-spacing:0.15em;margin-left:6px;color:var(--gold);text-transform:uppercase">Latest</span>' : ""}
        </div>
        <div class="history-match__score">
          <span class="history-match__score-num" style="${sylStyle}">${match.sylvans}</span>
          <span class="history-match__score-sep">—</span>
          <span class="history-match__score-num" style="${cpfcStyle}">${match.cpfc}</span>
        </div>
        <div class="history-match__team history-match__team--away" style="${cpfcStyle}">
          ${RLL_CONFIG.TEAMS.CPFC.shortName}
        </div>
        <div class="history-match__meta">
          <span class="history-match__date">📅 ${match.date}</span>
          ${match.motm !== "—" ? `<span class="history-match__motm">⭐ ${match.motm}</span>` : ""}
          ${resultLabel}
        </div>
      </div>
    `;
  }).join("");
}

/* ── COMPARISON BAR BUILDER ──────────────────────── */
function buildComparisonBar(data, labelA, valueA, labelB, valueB) {
  const total = valueA + valueB;
  const pctA  = total ? Math.round((valueA / total) * 100) : 50;
  const pctB  = 100 - pctA;

  return `
    <div class="comparison-bar">
      <div class="comparison-bar__row comparison-bar__row--sylvans reveal">
        <span class="comparison-bar__team">${labelA}</span>
        <div class="comparison-bar__track">
          <div class="comparison-bar__fill" data-pct="${pctA}"></div>
        </div>
        <span class="comparison-bar__value" data-count="${valueA}" data-duration="1100">${valueA}</span>
      </div>
      <div class="comparison-bar__row comparison-bar__row--cpfc reveal">
        <span class="comparison-bar__team">${labelB}</span>
        <div class="comparison-bar__track">
          <div class="comparison-bar__fill" data-pct="${pctB}"></div>
        </div>
        <span class="comparison-bar__value" data-count="${valueB}" data-duration="1100">${valueB}</span>
      </div>
    </div>
  `;
}

/* ── FORM GUIDE BUILDER ──────────────────────────── */
function buildFormGuide(history, team) {
  const form = RLLData.recentForm(history, team, 5);
  if (!form.length) return "";
  return `<div class="form-guide">
    ${form.map(r => `<div class="form-badge form-badge--${r}">${r}</div>`).join("")}
  </div>`;
}

/* ── MOTM LEADERBOARD BUILDER ─────────────────────── */
function buildMOTMLeaderboard(history) {
  const counts = {};
  history.forEach(m => {
    if (m.motm && m.motm !== "—") counts[m.motm] = (counts[m.motm] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return '<p class="text-muted">No data yet.</p>';

  return `<div class="motm-list">
    ${sorted.map(([name, count], i) => `
      <div class="motm-row reveal">
        <span class="motm-rank">#${i + 1}</span>
        <span class="motm-name">${name}</span>
        <span class="motm-count">${count}x ⭐</span>
      </div>
    `).join("")}
  </div>`;
}

/* ── PARTICLE BACKGROUND (subtle) ───────────────── */
function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles = [];

  function resize() {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.reset = function() {
      this.x    = Math.random() * w;
      this.y    = Math.random() * h;
      this.size = Math.random() * 1.5 + 0.3;
      this.vx   = (Math.random() - 0.5) * 0.25;
      this.vy   = (Math.random() - 0.5) * 0.25;
      this.alpha = Math.random() * 0.35 + 0.05;
    };
    this.update = function() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
    };
    this.reset();
  }

  function init() {
    resize();
    particles = Array.from({ length: 60 }, () => new Particle());
    window.addEventListener("resize", resize, { passive:true });
    loop();
  }

  function loop() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }

  init();
}

/* ── DEMO BADGE ──────────────────────────────────── */
function showDemoBadge() {
  const badge = document.getElementById("demo-badge");
  if (badge) badge.style.display = "flex";
}

/* ── INIT ────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  PageTransition.init();
  Nav.init();
  Reveal.init();
  Counter.initAll();
  Bars.init();
});
