(() => {
  "use strict";

  // ---------- storage ----------
  const STORE_KEY = "kana-dojo-v1";
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } };
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} };

  const state = Object.assign({
    progress: {},            // char -> { c: correct, w: wrong, s: current streak }
    settings: { script: "hira", mode: "type", rows: ["a","k","s"], len: 20 },
    days: { last: null, streak: 0 },
    answered: 0, correct: 0,
  }, load());

  // ---------- data ----------
  // Flatten into a lookup of every kana (both scripts)
  const ALL = [];
  KANA_ROWS.forEach(row => row.items.forEach(([h, k, ...romaji]) => {
    ALL.push({ char: h, script: "hira", romaji, row: row.id, hira: h });
    ALL.push({ char: k, script: "kata", romaji, row: row.id, hira: h });
  }));
  const BY_CHAR = Object.fromEntries(ALL.map(x => [x.char, x]));

  const level = (char) => {
    const p = state.progress[char];
    if (!p || p.c + p.w === 0) return 0;
    const acc = p.c / (p.c + p.w);
    if (p.s >= 5 && acc >= 0.85) return 3;
    if (p.s >= 3 && acc >= 0.7) return 2;
    return 1;
  };

  // ---------- helpers ----------
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const today = () => new Date().toISOString().slice(0, 10);

  // ---------- speech ----------
  let jaVoice = null;
  const pickVoice = () => {
    if (!("speechSynthesis" in window)) return;
    const vs = speechSynthesis.getVoices();
    jaVoice = vs.find(v => v.lang === "ja-JP") || vs.find(v => v.lang && v.lang.startsWith("ja")) || null;
  };
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP"; u.rate = 0.8;
    if (jaVoice) u.voice = jaVoice;
    speechSynthesis.speak(u);
  };

  // ---------- tabs ----------
  $$(".tab").forEach(t => t.addEventListener("click", () => {
    $$(".tab").forEach(x => x.classList.toggle("active", x === t));
    $$(".view").forEach(v => v.classList.add("hidden"));
    $("#view-" + t.dataset.view).classList.remove("hidden");
    if (t.dataset.view === "chart") renderChart();
    if (t.dataset.view === "practice") renderStats();
  }));

  // ---------- setup ----------
  const bindSeg = (sel, key, onChange) => {
    const seg = $(sel);
    seg.querySelectorAll("button").forEach(b => {
      b.classList.toggle("on", b.dataset.v === state.settings[key]);
      b.addEventListener("click", () => {
        state.settings[key] = b.dataset.v;
        seg.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
        save(); onChange && onChange();
      });
    });
  };
  bindSeg("#script-seg", "script");
  bindSeg("#mode-seg", "mode");

  const renderRows = () => {
    const wrap = $("#row-groups");
    wrap.innerHTML = "";
    Object.entries(GROUP_LABELS).forEach(([g, label]) => {
      const rows = KANA_ROWS.filter(r => r.group === g);
      const div = document.createElement("div");
      div.className = "group";
      const allOn = rows.every(r => state.settings.rows.includes(r.id));
      div.innerHTML = `<div class="group-head"><span>${label}</span><button data-g="${g}">${allOn ? "Clear" : "Select all"}</button></div><div class="rows"></div>`;
      const rowsEl = div.querySelector(".rows");
      rows.forEach(r => {
        const b = document.createElement("button");
        b.className = "chip" + (state.settings.rows.includes(r.id) ? " on" : "");
        b.textContent = state.settings.script === "kata" ? toKataLabel(r) : r.label;
        b.addEventListener("click", () => {
          const set = new Set(state.settings.rows);
          set.has(r.id) ? set.delete(r.id) : set.add(r.id);
          state.settings.rows = [...set]; save(); renderRows();
        });
        rowsEl.appendChild(b);
      });
      div.querySelector(".group-head button").addEventListener("click", () => {
        const set = new Set(state.settings.rows);
        rows.forEach(r => allOn ? set.delete(r.id) : set.add(r.id));
        state.settings.rows = [...set]; save(); renderRows();
      });
      wrap.appendChild(div);
    });
    const n = KANA_ROWS.filter(r => state.settings.rows.includes(r.id)).reduce((a, r) => a + r.items.length, 0);
    $("#row-count").textContent = n ? `${n} kana selected` : "pick at least one row";
    $("#start").disabled = n < 2;
  };
  const toKataLabel = (r) => {
    const [h, k] = r.items[0];
    return r.label.replace(h, k);
  };
  // re-label chips when script changes
  $("#script-seg").addEventListener("click", renderRows);

  $("#len").value = String(state.settings.len);
  $("#len").addEventListener("change", e => { state.settings.len = +e.target.value; save(); });

  const renderStats = () => {
    const mastered = ALL.filter(x => level(x.char) === 3).length;
    const acc = state.answered ? Math.round(100 * state.correct / state.answered) : 0;
    const streak = (state.days.last === today() || isYesterday(state.days.last)) ? state.days.streak : 0;
    $("#stats-row").innerHTML = `
      <div class="stat"><b>${streak}</b><span>day streak</span></div>
      <div class="stat"><b>${acc}%</b><span>accuracy</span></div>
      <div class="stat"><b>${mastered}<small style="font-size:13px;color:var(--muted)"> / ${ALL.length}</small></b><span>mastered</span></div>`;
  };
  const isYesterday = (d) => {
    if (!d) return false;
    const y = new Date(); y.setDate(y.getDate() - 1);
    return d === y.toISOString().slice(0, 10);
  };
  const touchDay = () => {
    const t = today();
    if (state.days.last === t) return;
    state.days.streak = isYesterday(state.days.last) ? state.days.streak + 1 : 1;
    state.days.last = t;
  };

  // ---------- quiz ----------
  let quiz = null;

  const buildPool = () => {
    const rows = new Set(state.settings.rows);
    const scripts = state.settings.script === "both" ? ["hira", "kata"] : [state.settings.script];
    return ALL.filter(x => rows.has(x.row) && scripts.includes(x.script));
  };

  // Weighted pick: weak or unseen kana come up more often
  const nextItem = () => {
    const pool = quiz.pool.filter(x => x.char !== quiz.lastChar);
    const weights = pool.map(x => {
      const p = state.progress[x.char];
      if (!p) return 3;
      return Math.max(0.4, 1 + p.w * 1.5 - Math.min(p.s, 6) * 0.35);
    });
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  };

  const start = () => {
    const pool = buildPool();
    if (pool.length < 2) return;
    quiz = { pool, n: 0, correct: 0, total: state.settings.len, mode: state.settings.mode, missed: {}, lastChar: null, locked: false };
    $("#setup").classList.add("hidden");
    $("#results").classList.add("hidden");
    $("#quiz").classList.remove("hidden");
    touchDay(); save();
    ask();
  };

  const ask = () => {
    if (quiz.total && quiz.n >= quiz.total) return finish();
    const item = nextItem();
    quiz.item = item; quiz.lastChar = item.char; quiz.locked = false;
    const mode = quiz.mode;
    const prompt = $("#prompt");
    $("#feedback").textContent = ""; $("#feedback").className = "feedback";
    $("#type-form").classList.toggle("hidden", mode !== "type");
    $("#choices").classList.toggle("hidden", mode === "type");
    $("#speak").classList.toggle("hidden", mode === "pick");
    prompt.classList.toggle("romaji", mode === "pick");

    if (mode === "type") {
      prompt.textContent = item.char;
      const inp = $("#type-input");
      inp.value = ""; inp.className = ""; inp.readOnly = false; inp.focus();
      $("#keys-hint").textContent = "Enter to check";
    } else {
      prompt.textContent = mode === "pick" ? item.romaji[0] : "🔊";
      renderChoices(item);
      $("#keys-hint").textContent = "Keys 1 to 4 to answer";
      if (mode === "listen") setTimeout(() => speak(item.hira), 150);
    }
    updateBar();
  };

  const renderChoices = (item) => {
    // distractors: same script, different sound
    const others = shuffle(quiz.pool.filter(x => x.script === item.script && x.romaji[0] !== item.romaji[0]));
    const fallback = shuffle(ALL.filter(x => x.script === item.script && x.romaji[0] !== item.romaji[0]));
    const picks = [item];
    for (const x of [...others, ...fallback]) {
      if (picks.length >= 4) break;
      if (!picks.some(p => p.romaji[0] === x.romaji[0])) picks.push(x);
    }
    const box = $("#choices");
    box.innerHTML = "";
    shuffle(picks).forEach((x, i) => {
      const b = document.createElement("button");
      b.className = "choice"; b.dataset.char = x.char;
      b.innerHTML = `<span class="k">${i + 1}</span>${x.char}`;
      b.addEventListener("click", () => choose(b));
      box.appendChild(b);
    });
  };

  const record = (ok) => {
    const c = quiz.item.char;
    const p = state.progress[c] || (state.progress[c] = { c: 0, w: 0, s: 0 });
    if (ok) { p.c++; p.s++; quiz.correct++; state.correct++; }
    else { p.w++; p.s = 0; quiz.missed[c] = (quiz.missed[c] || 0) + 1; }
    state.answered++; quiz.n++;
    save(); updateBar();
  };

  const showFeedback = (ok) => {
    const fb = $("#feedback");
    const it = quiz.item;
    fb.className = "feedback " + (ok ? "good" : "bad");
    fb.innerHTML = ok
      ? `Correct! <span class="jp">${it.char}</span> = ${it.romaji[0]}`
      : `<span class="jp">${it.char}</span> is <b>${it.romaji[0]}</b>`;
  };

  $("#type-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (quiz.locked) { ask(); return; }
    const inp = $("#type-input");
    const val = inp.value.trim().toLowerCase();
    if (!val) return;
    const ok = quiz.item.romaji.includes(val);
    quiz.locked = true; inp.readOnly = true;
    inp.className = ok ? "good" : "bad";
    record(ok); showFeedback(ok);
    speak(quiz.item.hira);
    if (ok) setTimeout(() => { if (quiz && quiz.locked && $("#type-input").className === "good") ask(); }, 700);
    else $("#keys-hint").textContent = "Enter to continue";
  });

  const choose = (btn) => {
    if (quiz.locked) return;
    quiz.locked = true;
    const ok = btn.dataset.char === quiz.item.char;
    btn.classList.add(ok ? "good" : "bad");
    if (!ok) $$(".choice").find(b => b.dataset.char === quiz.item.char).classList.add("good");
    record(ok); showFeedback(ok);
    if (quiz.mode === "pick") speak(quiz.item.hira);
    setTimeout(() => quiz && ask(), ok ? 700 : 1600);
  };

  document.addEventListener("keydown", (e) => {
    if (!quiz || $("#quiz").classList.contains("hidden")) return;
    if (quiz.mode !== "type" && /^[1-4]$/.test(e.key)) {
      const b = $$(".choice")[+e.key - 1]; if (b) b.click();
    }
  });

  $("#speak").addEventListener("click", () => quiz && speak(quiz.item.hira));

  const updateBar = () => {
    const pct = quiz.total ? (100 * quiz.n / quiz.total) : (quiz.n % 20) * 5;
    $("#bar").style.width = pct + "%";
    $("#score").textContent = `${quiz.correct} / ${quiz.n}`;
  };

  const finish = () => {
    $("#quiz").classList.add("hidden");
    $("#results").classList.remove("hidden");
    const pct = quiz.n ? Math.round(100 * quiz.correct / quiz.n) : 0;
    $("#big-score").innerHTML = `${pct}%<small>${quiz.correct} of ${quiz.n} correct</small>`;
    const missed = Object.keys(quiz.missed);
    $("#missed").innerHTML = missed.length
      ? `<p class="center hint">Review these:</p><div class="missed-list">${missed.map(c => `<div class="missed-item"><b>${c}</b><span>${BY_CHAR[c].romaji[0]}</span></div>`).join("")}</div>`
      : `<p class="center hint">No mistakes. すごい!</p>`;
    quiz = null;
    speechSynthesis && speechSynthesis.cancel && speechSynthesis.cancel();
  };

  $("#start").addEventListener("click", start);
  $("#again").addEventListener("click", start);
  $("#quit").addEventListener("click", () => quiz && (quiz.n ? finish() : backToSetup()));
  const backToSetup = () => {
    quiz = null;
    ["#quiz", "#results"].forEach(s => $(s).classList.add("hidden"));
    $("#setup").classList.remove("hidden");
    renderStats();
  };
  $("#back").addEventListener("click", backToSetup);

  // ---------- chart ----------
  let chartScript = "hira";
  $$("#chart-seg button").forEach(b => b.addEventListener("click", () => {
    chartScript = b.dataset.v;
    $$("#chart-seg button").forEach(x => x.classList.toggle("on", x === b));
    renderChart();
  }));

  // grid positions so the chart looks like a real gojūon table
  const LAYOUT = { y: [0, 2, 4], w: [0, 4] };

  const renderChart = () => {
    const idx = chartScript === "hira" ? 0 : 1;
    const out = [];
    Object.entries(GROUP_LABELS).forEach(([g, label]) => {
      const rows = KANA_ROWS.filter(r => r.group === g);
      const cols = g === "yoon" ? 3 : 5;
      let cells = "";
      rows.forEach(r => {
        let items = r.items;
        let extra = [];
        if (r.id === "w") { extra = [items[2]]; items = items.slice(0, 2); }
        const slots = Array(cols).fill(null);
        const pos = LAYOUT[r.id] || items.map((_, i) => i);
        items.forEach((it, i) => slots[pos[i]] = it);
        const rowsToDraw = [slots];
        if (extra.length) rowsToDraw.push([extra[0], null, null, null, null]);
        rowsToDraw.forEach(sl => sl.forEach(it => {
          if (!it) { cells += `<div class="cell empty"></div>`; return; }
          const ch = it[idx];
          cells += `<button class="cell lv${level(ch)}" data-h="${it[0]}" title="${progressTitle(ch)}"><b>${ch}</b><span>${it[2]}</span></button>`;
        }));
      });
      out.push(`<div class="chart-group"><h3>${label}</h3><div class="chart-grid ${g === "yoon" ? "yoon" : ""}">${cells}</div></div>`);
    });
    $("#chart").innerHTML = out.join("");
    $$("#chart .cell[data-h]").forEach(c => c.addEventListener("click", () => speak(c.dataset.h)));
  };
  const progressTitle = (ch) => {
    const p = state.progress[ch];
    return p ? `${p.c} right, ${p.w} wrong` : "not practised yet";
  };

  $("#export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kana-progress-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $("#reset").addEventListener("click", () => {
    if (!confirm("Reset all progress? This cannot be undone.")) return;
    state.progress = {}; state.answered = 0; state.correct = 0; state.days = { last: null, streak: 0 };
    save(); renderChart(); renderStats();
  });

  // ---------- init ----------
  renderRows();
  renderStats();
})();
