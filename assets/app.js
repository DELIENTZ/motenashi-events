// もてなし広場 イベントナビ — データ駆動レンダラー
// data/events.json を読み込んで一覧＋カレンダーを描画する。データを足すだけで更新できる。

const SUBMIT_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSclMeV7NcGh3jhUsSzC49t_H1GViY7PVhjLpSHf92X_gN2HsQ/viewform"; // 投稿フォーム
const CONTACT_EMAIL = "takasaki.event.navi@gmail.com"; // 連絡用メール。問い合わせ・運営参加の受付

const DOW = ["日", "月", "火", "水", "木", "金", "土"];
const state = { events: [], tags: [], period: "upcoming", query: "" };

// イベントの絞り込み対象タグ＝カテゴリ＋tags をまとめた一覧（重複除去）
function eventTerms(ev) {
  return [...new Set([ev.category, ...(ev.tags || [])].filter(Boolean))];
}
let calYM = null; // カレンダー表示中の {y, m}（mは0始まり）
let dateMap = {}; // "YYYY-MM-DD" => [event, ...]

const $ = (s) => document.querySelector(s);
const todayStr = () => new Date().toISOString().slice(0, 10);
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

async function init() {
  try {
    const res = await fetch("data/events.json", { cache: "no-store" });
    const data = await res.json();
    state.events = (data.events || []).filter((e) => e.status !== "draft");
    $("#updated").textContent = data.site?.updated || "—";
    if (state.events.some((e) => e.isSample)) $("#sample-banner").hidden = false;
  } catch (err) {
    $("#event-list").innerHTML = `<p class="empty">データの読み込みに失敗しました。</p>`;
    return;
  }
  buildDateMap();
  buildTagFilters();
  bindControls();
  injectJsonLd();
  initCalendarMonth();
  renderCalendar();
  render();
  setupSubmitButton();
  setupContactButton();
}

// 投稿フォームのURLが未設定なら、死リンクにせず「準備中」表示にする
function setupSubmitButton() {
  const b = $("#submit-form-link");
  if (!b) return;
  if (SUBMIT_FORM_URL) {
    b.href = SUBMIT_FORM_URL;
    b.target = "_blank";
  } else {
    b.removeAttribute("href");
    b.classList.add("disabled");
    b.textContent = "投稿フォーム準備中";
  }
}

// 連絡用メールが未設定なら「準備中」表示にする
function setupContactButton() {
  const b = $("#contact-link");
  if (!b) return;
  if (CONTACT_EMAIL) {
    b.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      "もてなし広場イベントナビ お問い合わせ"
    )}`;
  } else {
    b.removeAttribute("href");
    b.classList.add("disabled");
    b.textContent = "お問い合わせ先 準備中";
  }
}

// 各イベントを開催日（複数日にまたがる場合は全日）でマップ化
function buildDateMap() {
  dateMap = {};
  for (const ev of state.events) {
    const start = new Date(ev.start + "T00:00:00");
    const end = new Date((ev.end || ev.start) + "T00:00:00");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = ymd(d);
      (dateMap[key] = dateMap[key] || []).push(ev);
    }
  }
}

// カレンダーの初期表示月：今日以降で一番近いイベントの月（無ければ今月）
function initCalendarMonth() {
  const t = todayStr();
  const upcoming = state.events
    .map((e) => e.start)
    .filter((s) => s >= t)
    .sort();
  const base = upcoming[0] ? new Date(upcoming[0] + "T00:00:00") : new Date();
  calYM = { y: base.getFullYear(), m: base.getMonth() };
}

function renderCalendar() {
  const { y, m } = calYM;
  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const t = todayStr();

  let cells = "";
  for (let i = 0; i < startDow; i++) cells += `<span class="cal-cell empty"></span>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const evs = dateMap[key] || [];
    const dow = new Date(y, m, d).getDay();
    const cls = [
      "cal-cell",
      evs.length ? "has-event" : "",
      key === t ? "today" : "",
      dow === 0 ? "sun" : "",
      dow === 6 ? "sat" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const names = evs.map((e) => e.title).join("、");
    const label = evs.length ? ` aria-label="${d}日：${names}" title="${names}"` : "";
    const evName = evs.length
      ? `<span class="cal-ev">${esc(shortName(evs[0].title))}${
          evs.length > 1 ? `<span class="cal-more">+${evs.length - 1}</span>` : ""
        }</span>`
      : "";
    cells += `<button type="button" class="${cls}" data-date="${key}" ${
      evs.length ? "" : "disabled"
    }${label}><span class="cal-num">${d}</span>${evName}</button>`;
  }

  // この月のイベント一覧（名前つき）
  const firstKey = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const lastKey = `${y}-${String(m + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
  const monthEvents = state.events
    .filter((e) => (e.end || e.start) >= firstKey && e.start <= lastKey)
    .sort((a, b) => (a.start < b.start ? -1 : 1));
  const monthList = monthEvents.length
    ? `<ul class="cal-list">${monthEvents
        .map((e) => {
          const ds = new Date(e.start + "T00:00:00");
          let dlabel = `${ds.getMonth() + 1}/${ds.getDate()}（${DOW[ds.getDay()]}）`;
          if (e.end && e.end !== e.start) {
            const de = new Date(e.end + "T00:00:00");
            dlabel += `〜${de.getMonth() + 1}/${de.getDate()}`;
          }
          return `<li class="cal-li" data-date="${e.start}"><span class="cal-li-date">${dlabel}</span><span class="cal-li-name">${esc(
            e.title
          )}</span></li>`;
        })
        .join("")}</ul>`
    : `<p class="cal-empty">この月の登録イベントはありません</p>`;

  $("#calendar").innerHTML = `
    <div class="cal-head">
      <button type="button" class="cal-nav" id="cal-prev" aria-label="前の月">‹</button>
      <strong class="cal-title">${y}年${m + 1}月</strong>
      <button type="button" class="cal-nav" id="cal-next" aria-label="次の月">›</button>
    </div>
    <div class="cal-grid cal-dow">${DOW.map(
      (w, i) =>
        `<span class="cal-w ${i === 0 ? "sun" : ""}${i === 6 ? "sat" : ""}">${w}</span>`
    ).join("")}</div>
    <div class="cal-grid cal-days">${cells}</div>
    <p class="cal-hint">📅 色付きの日付、または下の一覧をタップするとイベントへ移動します</p>
    <div class="cal-month-events">
      <h3 class="cal-list-title">🗓 ${m + 1}月のイベント</h3>
      ${monthList}
    </div>`;

  $("#cal-prev").onclick = () => shiftMonth(-1);
  $("#cal-next").onclick = () => shiftMonth(1);
  $("#calendar")
    .querySelectorAll(".cal-cell.has-event")
    .forEach((b) => (b.onclick = () => jumpToDate(b.dataset.date)));
  $("#calendar")
    .querySelectorAll(".cal-li")
    .forEach((li) => (li.onclick = () => jumpToDate(li.dataset.date)));
}

// カレンダーのマスに収まるよう名前を短縮
function shortName(title = "") {
  const t = title.replace(/（.*?）/g, "").trim(); // 括弧書きを除去
  return t.length > 6 ? t.slice(0, 6) + "…" : t;
}

function shiftMonth(delta) {
  let m = calYM.m + delta,
    y = calYM.y;
  if (m < 0) { m = 11; y--; }
  if (m > 11) { m = 0; y++; }
  calYM = { y, m };
  renderCalendar();
}

// カレンダーの日付タップ → その日のイベントを必ず表示してスクロール＆ハイライト
function jumpToDate(key) {
  const evs = dateMap[key];
  if (!evs || !evs.length) return;
  // フィルタを解除して、過去・今後に関わらず確実に表示
  state.period = "all";
  state.tags = [];
  state.query = "";
  $("#search").value = "";
  document.querySelector('input[name="period"][value="all"]').checked = true;
  syncChips();
  render();

  const target = document.getElementById("ev-" + evs[0].id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    evs.forEach((ev) => {
      const el = document.getElementById("ev-" + ev.id);
      if (el) {
        el.classList.add("flash");
        setTimeout(() => el.classList.remove("flash"), 2000);
      }
    });
  }
}

// カテゴリ＋タグを頻度順にまとめて、複数選択できるチップを作る
function buildTagFilters() {
  const freq = {};
  for (const ev of state.events) {
    for (const term of eventTerms(ev)) freq[term] = (freq[term] || 0) + 1;
  }
  const terms = Object.keys(freq).sort(
    (a, b) => freq[b] - freq[a] || a.localeCompare(b, "ja")
  );
  $("#category-filters").innerHTML =
    `<button class="chip active" data-tag="all">すべて</button>` +
    terms
      .map((t) => `<button class="chip" data-tag="${esc(t)}">${esc(t)}</button>`)
      .join("");
}

// 選択中のタグに合わせてチップの active 表示を同期
function syncChips() {
  document.querySelectorAll("#category-filters .chip").forEach((c) => {
    const tag = c.dataset.tag;
    const active = tag === "all" ? state.tags.length === 0 : state.tags.includes(tag);
    c.classList.toggle("active", active);
  });
}

// タグの選択/解除（all は全解除）
function toggleTag(tag, { additive = false } = {}) {
  if (tag === "all") {
    state.tags = [];
  } else if (additive) {
    if (!state.tags.includes(tag)) state.tags.push(tag);
  } else {
    const i = state.tags.indexOf(tag);
    if (i >= 0) state.tags.splice(i, 1);
    else state.tags.push(tag);
  }
  syncChips();
  render();
}

function bindControls() {
  $("#category-filters").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    toggleTag(b.dataset.tag);
  });
  // カード内のカテゴリ／タグをタップしても絞り込めるように（追加方式）
  $("#event-list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tag]");
    if (!b || !b.dataset.tag) return;
    toggleTag(b.dataset.tag, { additive: true });
    $("#category-filters").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  $("#search").addEventListener("input", (e) => {
    state.query = e.target.value.trim().toLowerCase();
    render();
  });
  document.querySelectorAll('input[name="period"]').forEach((r) =>
    r.addEventListener("change", (e) => {
      state.period = e.target.value;
      render();
    })
  );
}

function matches(ev) {
  const t = todayStr();
  if (state.period === "upcoming" && (ev.end || ev.start) < t) return false;
  if (state.period === "past" && (ev.end || ev.start) >= t) return false;
  // 複数タグ：選択中タグのどれか1つでも当てはまれば表示（OR）
  if (state.tags.length) {
    const terms = eventTerms(ev);
    if (!state.tags.some((t) => terms.includes(t))) return false;
  }
  if (state.query) {
    const hay = `${ev.title} ${ev.summary} ${(ev.tags || []).join(" ")} ${ev.category}`.toLowerCase();
    if (!hay.includes(state.query)) return false;
  }
  return true;
}

function fmtDate(ev) {
  const d = new Date(ev.start + "T00:00:00");
  const base = `${d.getMonth() + 1}/${d.getDate()}`;
  const dow = DOW[d.getDay()];
  if (ev.end && ev.end !== ev.start) {
    const d2 = new Date(ev.end + "T00:00:00");
    return `${base}（${dow}）〜 ${d2.getMonth() + 1}/${d2.getDate()}`;
  }
  return `${base}<span class="dow">（${dow}）</span>`;
}

function render() {
  const list = state.events
    .filter(matches)
    .sort((a, b) => (a.start < b.start ? -1 : 1) * (state.period === "past" ? -1 : 1));

  $("#result-count").textContent = `${list.length} 件のイベント`;

  if (!list.length) {
    $("#event-list").innerHTML = `<p class="empty">条件に合うイベントがありません。</p>`;
    return;
  }

  $("#event-list").innerHTML = list
    .map(
      (ev) => `
    <article class="card" id="ev-${ev.id}">
      <div class="card-date">${fmtDate(ev)}${ev.time ? `<span class="dow">${ev.time}</span>` : ""}</div>
      <div class="card-body">
        ${ev.category ? `<button type="button" class="card-cat" data-tag="${esc(ev.category)}">${esc(ev.category)}</button>` : `<span class="card-cat">イベント</span>`}
        <h3 class="card-title">${esc(ev.title)}${ev.tentative ? ' <span class="badge-tentative">⚠未確定</span>' : ""}${ev.isSample ? ' <span class="badge-sample">サンプル</span>' : ""}</h3>
        <div class="card-meta">
          <span>📍 ${esc(ev.venue || "もてなし広場")}</span>
          ${ev.fee ? `<span>💴 ${esc(ev.fee)}</span>` : ""}
        </div>
        ${ev.summary ? `<p class="card-summary">${esc(ev.summary)}</p>` : ""}
        <div class="card-tags">
          ${(ev.tags || []).map((t) => `<button type="button" class="tag" data-tag="${esc(t)}">#${esc(t)}</button>`).join("")}
        </div>
        ${links(ev)}
      </div>
    </article>`
    )
    .join("");
}

function links(ev) {
  const parts = [];
  if (ev.official_url) parts.push(`<a href="${ev.official_url}" target="_blank" rel="noopener">公式サイト →</a>`);
  if (ev.source_url) parts.push(`<a href="${ev.source_url}" target="_blank" rel="noopener">出典：${esc(ev.source || "リンク")}</a>`);
  return parts.length ? `<div class="card-links">${parts.join("")}</div>` : "";
}

// SEO：Googleのイベント検索に拾われやすいよう構造化データを出力
function injectJsonLd() {
  const items = state.events.map((ev) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.title,
    startDate: ev.start,
    endDate: ev.end || ev.start,
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: ev.venue || "もてなし広場", address: "群馬県高崎市" },
    description: ev.summary || "",
    ...(ev.official_url ? { url: ev.official_url } : {}),
  }));
  $("#jsonld-events").textContent = JSON.stringify(items);
}

function esc(s = "") {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

init();
