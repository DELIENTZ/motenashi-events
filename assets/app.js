// もてなし広場 イベントナビ — データ駆動レンダラー
// data/events.json を読み込んで一覧を描画する。データを足すだけで更新できる。

const SUBMIT_FORM_URL = ""; // ← Googleフォームの公開URLを入れると「情報を提供する」ボタンが有効化

const DOW = ["日", "月", "火", "水", "木", "金", "土"];
const state = { events: [], category: "all", period: "upcoming", query: "" };

const $ = (s) => document.querySelector(s);
const todayStr = () => new Date().toISOString().slice(0, 10);

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
  buildCategoryFilters();
  bindControls();
  injectJsonLd();
  render();
  if (SUBMIT_FORM_URL) $("#submit-form-link").href = SUBMIT_FORM_URL;
}

function buildCategoryFilters() {
  const cats = ["all", ...new Set(state.events.map((e) => e.category).filter(Boolean))];
  $("#category-filters").innerHTML = cats
    .map(
      (c) =>
        `<button class="chip ${c === "all" ? "active" : ""}" data-cat="${c}">${
          c === "all" ? "すべて" : c
        }</button>`
    )
    .join("");
}

function bindControls() {
  $("#category-filters").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    b.classList.add("active");
    state.category = b.dataset.cat;
    render();
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
  if (state.category !== "all" && ev.category !== state.category) return false;
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
    <article class="card">
      <div class="card-date">${fmtDate(ev)}${ev.time ? `<span class="dow">${ev.time}</span>` : ""}</div>
      <div class="card-body">
        <span class="card-cat">${ev.category || "イベント"}</span>
        <h3 class="card-title">${esc(ev.title)}${ev.isSample ? ' <span class="badge-sample">サンプル</span>' : ""}</h3>
        <div class="card-meta">
          <span>📍 ${esc(ev.venue || "もてなし広場")}</span>
          ${ev.fee ? `<span>💴 ${esc(ev.fee)}</span>` : ""}
        </div>
        ${ev.summary ? `<p class="card-summary">${esc(ev.summary)}</p>` : ""}
        <div class="card-tags">
          ${(ev.tags || []).map((t) => `<span class="tag">#${esc(t)}</span>`).join("")}
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
