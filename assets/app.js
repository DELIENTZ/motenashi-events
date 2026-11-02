import { FEE_LABELS, todayJst, validDate, eventVenues, sortVenues, eventTerms, eventOnDate, matchesEvent, sortEvents, sortCalendarEvents, prioritizeMainVenue } from "./event-utils.js";

const SUBMIT_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSclMeV7NcGh3jhUsSzC49t_H1GViY7PVhjLpSHf92X_gN2HsQ/viewform";
const JOIN_FORM_URL = "https://forms.gle/qe2dtYBFmhKAG8ys9";
const DOW = ["日", "月", "火", "水", "木", "金", "土"];
const PAGE_SIZE = 50;
const defaults = { venue: "", fee: "", category: "", period: "upcoming", from: "", to: "", query: "", tentative: false, tags: [] };
const state = { events: [], filters: { ...defaults, tags: [] }, view: "calendar", sort: "featured", direction: "asc", limit: PAGE_SIZE, selectedDate: "" };
const $ = selector => document.querySelector(selector);
let calYM;

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
function safeUrl(value) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? esc(url.href) : ""; }
  catch { return ""; }
}
function fmtDay(key, year = false) {
  const d = new Date(key + "T00:00:00Z");
  return `${year ? d.getUTCFullYear() + "/" : ""}${d.getUTCMonth() + 1}/${d.getUTCDate()}（${DOW[d.getUTCDay()]}）`;
}
function fmtDate(event) {
  if (event.dates?.length > 1) return event.dates.map(key => fmtDay(key, true)).join("・");
  return fmtDay(event.start, true) + (event.end && event.end !== event.start ? "〜" + fmtDay(event.end, true) : "");
}
function venueTags(event) {
  const venues = eventVenues(event);
  const detail = event.venue && !venues.includes(event.venue) ? `<span class="venue-detail">${esc(event.venue)}</span>` : "";
  return venues.map(venue => `<button type="button" class="venue-tag" data-venue="${esc(venue)}" aria-label="会場で絞り込み：${esc(venue)}">${esc(venue)}</button>`).join("") + detail;
}
function feeBadge(event) {
  const type = event.fee_type || "unknown";
  return `<span class="fee-badge fee-${esc(type)}">${FEE_LABELS[type] || FEE_LABELS.unknown}</span>`;
}
function eventLinks(event) {
  const official = safeUrl(event.official_url), source = safeUrl(event.source_url), parts = [];
  if (official) parts.push(`<a href="${official}" target="_blank" rel="noopener noreferrer">公式案内<span class="sr-only">：${esc(event.title)}</span> ↗</a>`);
  if (source && source !== official) parts.push(`<a href="${source}" target="_blank" rel="noopener noreferrer">${esc(event.source || "出典")} ↗</a>`);
  return parts.join(" ");
}
function statusBadge(event) {
  return event.cancelled ? '<span class="badge-tentative">中止</span>' : event.tentative ? '<span class="badge-tentative">未確定</span>' : "";
}
function dateNotice(event) {
  return event.excluded_dates?.length ? `<p class="date-notice">休催日：${event.excluded_dates.map(key => fmtDay(key)).join("、")}</p>` : "";
}
async function init() {
  $("#submit-form-link").href = SUBMIT_FORM_URL;
  $("#contact-link").href = JOIN_FORM_URL;
  try {
    const response = await fetch("data/events.json", { cache: "no-store" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const data = await response.json();
    if (!Array.isArray(data.events)) throw new Error("Invalid events");
    state.events = data.events.filter(event => event.status !== "draft" && validDate(event.start) && validDate(event.end || event.start));
    $("#updated").textContent = data.site?.updated || "要確認";
    $("#sample-banner").hidden = !state.events.some(event => event.isSample);
  } catch {
    $("#load-error").hidden = false;
    $("#reload-events").onclick = () => location.reload();
    $("#result-count").textContent = "読み込みエラー";
    $("#calendar").hidden = true;
    $(".controls").inert = true;
    $(".view-switch").inert = true;
    return;
  }
  const today = todayJst();
  calYM = { y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 };
  buildOptions(); restoreFilters(); bindControls(); injectJsonLd(); render();
}
function buildOptions() {
  const venues = sortVenues([...new Set(state.events.flatMap(eventVenues))]);
  const categories = [...new Set(state.events.map(event => event.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
  $("#venue-filter").innerHTML += venues.map(venue => `<option value="${esc(venue)}">${esc(venue)}</option>`).join("");
  $("#category-filter").innerHTML += categories.map(category => `<option value="${esc(category)}">${esc(category)}</option>`).join("");
}
function restoreFilters() {
  const params = new URLSearchParams(location.search);
  for (const [key, selector] of Object.entries({ venue: "#venue-filter", fee: "#fee-filter", category: "#category-filter", period: "#period-filter" })) {
    const value = params.get(key);
    if (value && [...$(selector).options].some(option => option.value === value)) state.filters[key] = value;
    $(selector).value = state.filters[key];
  }
  for (const key of ["from", "to"]) {
    const value = params.get(key);
    if (validDate(value)) state.filters[key] = value;
    $("#date-" + key).value = state.filters[key];
  }
  state.filters.query = params.get("q") || "";
  state.filters.tags = params.getAll("tag").filter(tag => state.events.some(event => eventTerms(event).includes(tag)));
  state.filters.tentative = params.get("tentative") === "1";
  $("#search").value = state.filters.query;
  $("#tentative-filter").checked = state.filters.tentative;
  $("#advanced-filters").open = Boolean(state.filters.from || state.filters.to || state.filters.period !== "upcoming" || state.filters.tentative);
  if (["calendar", "table", "cards"].includes(params.get("view"))) state.view = params.get("view");
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(params.get("month") || "")) {
    calYM = { y: Number(params.get("month").slice(0, 4)), m: Number(params.get("month").slice(5)) - 1 };
  }
  const day = params.get("day");
  if (state.view === "calendar" && validDate(day)) {
    state.selectedDate = day;
    calYM = { y: Number(day.slice(0, 4)), m: Number(day.slice(5, 7)) - 1 };
  }
}
function saveFilters() {
  const params = new URLSearchParams();
  for (const key of ["venue", "fee", "category", "period", "from", "to"]) {
    if (state.filters[key] && state.filters[key] !== defaults[key]) params.set(key, state.filters[key]);
  }
  if (state.filters.query) params.set("q", state.filters.query);
  if (state.filters.tentative) params.set("tentative", "1");
  for (const tag of state.filters.tags) params.append("tag", tag);
  if (state.view !== "calendar") params.set("view", state.view);
  if (state.view === "calendar" && state.selectedDate) params.set("day", state.selectedDate);
  const month = `${calYM.y}-${String(calYM.m + 1).padStart(2, "0")}`;
  if (month !== todayJst().slice(0, 7)) params.set("month", month);
  const search = params.toString();
  history.replaceState(null, "", location.pathname + (search ? "?" + search : "") + location.hash);
}
function changeFilter(key, value) {
  state.filters[key] = value; state.selectedDate = ""; state.limit = PAGE_SIZE;
  if (key === "from" && validDate(value)) calYM = { y: Number(value.slice(0, 4)), m: Number(value.slice(5, 7)) - 1 };
  render();
}
function bindControls() {
  for (const [key, selector] of Object.entries({ venue: "#venue-filter", fee: "#fee-filter", category: "#category-filter", period: "#period-filter", from: "#date-from", to: "#date-to" })) {
    $(selector).addEventListener("change", event => changeFilter(key, event.target.value));
  }
  $("#search").addEventListener("input", event => changeFilter("query", event.target.value));
  $("#tentative-filter").addEventListener("change", event => changeFilter("tentative", event.target.checked));
  $("#reset-filters").onclick = () => {
    state.filters = { ...defaults, tags: [] };
    for (const selector of ["#search", "#venue-filter", "#fee-filter", "#category-filter", "#date-from", "#date-to"]) $(selector).value = "";
    $("#period-filter").value = "upcoming"; $("#tentative-filter").checked = false;
    state.selectedDate = ""; state.limit = PAGE_SIZE; render();
  };
  document.querySelectorAll("[data-view]").forEach(button => button.onclick = () => { state.view = button.dataset.view; state.limit = PAGE_SIZE; render(); });
  $("#load-more").onclick = () => { state.limit += PAGE_SIZE; render(); };
  document.querySelector("main").addEventListener("click", event => {
    const venue = event.target.closest("[data-venue]");
    if (venue) { $("#venue-filter").value = venue.dataset.venue; changeFilter("venue", venue.dataset.venue); }
    const tag = event.target.closest("[data-tag]");
    if (tag) {
      const value = tag.dataset.tag;
      changeFilter("tags", state.filters.tags.includes(value) ? state.filters.tags.filter(item => item !== value) : [...state.filters.tags, value]);
    }
  });
}
function render() {
  const today = todayJst();
  const invalid = state.filters.from && state.filters.to && state.filters.from > state.filters.to;
  $("#filter-error").hidden = !invalid;
  $("#filter-error").textContent = invalid ? "終了日は開始日以降を指定してください。" : "";
  const events = invalid ? [] : sortEvents(state.events.filter(event => matchesEvent(event, state.filters, today)), state.sort, state.direction);
  $("#result-count").textContent = `${events.length} 件のイベント`;
  $("#active-tags").innerHTML = state.filters.tags.map(tag => `<button type="button" class="chip active" data-tag="${esc(tag)}" aria-label="タグを解除：${esc(tag)}">#${esc(tag)} ×</button>`).join("");
  document.querySelectorAll("[data-view]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.view === state.view)));
  $("#calendar").hidden = state.view !== "calendar"; $("#event-table").hidden = state.view !== "table"; $("#event-list").hidden = state.view !== "cards";
  $("#load-more").hidden = true;
  if (state.view === "calendar") renderCalendar(events);
  if (state.view === "table") renderTable(state.sort === "featured" ? prioritizeMainVenue(events) : events);
  if (state.view === "cards") renderCards(prioritizeMainVenue(events));
  saveFilters();
}
function renderCalendar(events) {
  const { y, m } = calYM;
  const today = todayJst();
  const first = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const count = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const last = `${y}-${String(m + 1).padStart(2, "0")}-${count}`;
  const monthFilters = { ...state.filters, from: state.filters.from > first ? state.filters.from : first, to: state.filters.to && state.filters.to < last ? state.filters.to : last };
  const monthEvents = sortCalendarEvents(events.filter(event => matchesEvent(event, monthFilters, today)));
  const firstDow = new Date(first + "T00:00:00Z").getUTCDay();
  let cells = '<span class="cal-cell empty" aria-hidden="true"></span>'.repeat(firstDow);
  for (let day = 1; day <= count; day++) {
    const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const allowed = key >= monthFilters.from && key <= monthFilters.to && (state.filters.period !== "upcoming" || key >= today);
    const onDay = allowed ? monthEvents.filter(event => eventOnDate(event, key)) : [];
    const dow = (firstDow + day - 1) % 7;
    const classes = ["cal-cell", onDay.length ? "has-event" : "", key === today ? "today" : "", dow === 0 ? "sun" : "", dow === 6 ? "sat" : ""].filter(Boolean).join(" ");
    const names = onDay.slice(0, 2).map(event => `<span class="cal-ev" title="${esc(event.title)}">${esc(event.title)}</span>`).join("");
    cells += `<button type="button" class="${classes}" data-date="${key}" aria-pressed="${state.selectedDate === key}" aria-label="${esc(fmtDay(key, true))}：${onDay.length}件${onDay.length ? "、" + esc(onDay.map(event => event.title).join("、")) : ""}"><span class="cal-num">${day}</span>${names}${onDay.length > 2 ? `<span class="cal-more">+${onDay.length - 2}件</span>` : ""}</button>`;
  }
  const selectedAllowed = state.selectedDate >= monthFilters.from && state.selectedDate <= monthFilters.to && (state.filters.period !== "upcoming" || state.selectedDate >= today);
  const agenda = state.selectedDate ? selectedAllowed ? monthEvents.filter(event => eventOnDate(event, state.selectedDate)) : [] : monthEvents;
  const shown = agenda.slice(0, state.limit);
  $("#calendar").innerHTML = `<div class="cal-head"><button type="button" class="cal-nav" id="cal-prev" title="前の月" aria-label="前の月">‹</button><h2 class="cal-title">${y}年${m + 1}月</h2><button type="button" class="cal-nav" id="cal-next" title="次の月" aria-label="次の月">›</button><button type="button" id="cal-today">今月</button></div><div class="cal-grid cal-dow">${DOW.map((label, index) => `<span class="cal-w ${index === 0 ? "sun" : index === 6 ? "sat" : ""}">${label}</span>`).join("")}</div><div class="cal-grid cal-days">${cells}</div><div class="agenda-head"><h3>${state.selectedDate ? fmtDay(state.selectedDate, true) : m + 1 + "月の予定"} <span>${agenda.length}件</span></h3>${state.selectedDate ? '<button type="button" id="clear-day">月全体</button>' : ""}</div><div class="calendar-agenda">${agenda.length ? `<div class="agenda-events">${shown.map(event => cardMarkup(event, true)).join("")}</div>` : '<p class="empty">この条件で確認できた掲載イベントはありません。</p>'}</div>`;
  for (const [id, delta] of [["#cal-prev", -1], ["#cal-next", 1]]) $(id).onclick = () => {
    const next = new Date(Date.UTC(y, m + delta, 1));
    calYM = { y: next.getUTCFullYear(), m: next.getUTCMonth() };
    state.selectedDate = ""; state.limit = PAGE_SIZE; render(); $(id).focus();
  };
  $("#cal-today").onclick = () => {
    const today = todayJst();
    calYM = { y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 };
    state.selectedDate = ""; state.limit = PAGE_SIZE; render(); $("#cal-today").focus();
  };
  $("#calendar").querySelectorAll("[data-date]").forEach(button => button.onclick = () => {
    const date = button.dataset.date;
    state.selectedDate = state.selectedDate === date ? "" : date; state.limit = PAGE_SIZE; render();
    $("#calendar").querySelector(`[data-date="${date}"]`).focus();
  });
  if ($("#clear-day")) $("#clear-day").onclick = () => { state.selectedDate = ""; render(); };
  $("#load-more").hidden = agenda.length <= state.limit;
}
function tableMarkup(events, sortable) {
  const headings = [["date", "開催日・時間"], ["title", "イベント"], ["venue", "会場"], ["fee", "料金"]];
  return `<div class="table-scroll"><table class="events-table"><caption class="sr-only">${sortable ? "条件に合うイベント" : "カレンダーのイベント"}</caption><thead><tr>${headings.map(([key, label]) => `<th scope="col"${sortable && key === state.sort ? ` aria-sort="${state.direction === "asc" ? "ascending" : "descending"}"` : ""}>${sortable ? `<button type="button" data-sort="${key}">${label}${key === state.sort ? state.direction === "asc" ? " ↑" : " ↓" : ""}</button>` : label}</th>`).join("")}</tr></thead><tbody>${events.map(event => `<tr data-event-id="${esc(event.id)}"><td class="table-date">${esc(fmtDate(event))}${event.time ? `<span>${esc(event.time)}</span>` : ""}${dateNotice(event)}</td><td class="table-title"><details><summary>${esc(event.title)} ${statusBadge(event)}</summary><div class="event-detail"><p>${esc(event.summary || "詳細は公式案内をご確認ください。")}</p>${event.category ? `<span class="card-cat">${esc(event.category)}</span>` : ""}<p class="card-links">${eventLinks(event)}</p>${event.checked ? `<p class="checked">確認：${esc(event.checked)}</p>` : ""}</div></details></td><td><div class="venue-tags">${venueTags(event)}</div></td><td>${feeBadge(event)}<p class="table-fee">${esc(event.fee || "公式案内をご確認ください")}</p></td></tr>`).join("")}</tbody></table></div>`;
}
function renderTable(events) {
  $("#event-table").innerHTML = events.length ? tableMarkup(events.slice(0, state.limit), true) : '<p class="empty">条件に合う掲載イベントはありません。</p>';
  $("#event-table").querySelectorAll("[data-sort]").forEach(button => button.onclick = () => {
    state.direction = state.sort === button.dataset.sort && state.direction === "asc" ? "desc" : "asc";
    state.sort = button.dataset.sort; render(); $("#event-table").querySelector(`[data-sort="${state.sort}"]`).focus();
  });
  $("#load-more").hidden = events.length <= state.limit;
}
function cardMarkup(event, calendar = false) {
  const heading = calendar ? "h4" : "h2";
  return `<article class="card" id="${calendar ? "cal-ev-" : "ev-"}${esc(event.id)}" data-event-id="${esc(event.id)}"><div class="card-date">${esc(fmtDate(event))}</div><div class="card-body"><div class="card-meta">${event.category ? `<button type="button" class="card-cat" data-tag="${esc(event.category)}">${esc(event.category)}</button>` : ""}${feeBadge(event)}</div><${heading} class="card-title">${esc(event.title)} ${statusBadge(event)}</${heading}><div class="venue-tags">${venueTags(event)}</div><p class="card-meta">${esc(event.time || "時刻は公式案内をご確認ください")}</p>${dateNotice(event)}<p class="card-summary">${esc(event.summary || "")}</p><p class="card-meta">${esc(event.fee || "料金は公式案内をご確認ください")}</p><div class="card-tags">${(event.tags || []).map(tag => `<button type="button" class="tag" data-tag="${esc(tag)}">#${esc(tag)}</button>`).join("")}</div><div class="card-links">${eventLinks(event)}</div>${event.checked ? `<p class="checked">確認：${esc(event.checked)}</p>` : ""}</div></article>`;
}
function renderCards(events) {
  $("#event-list").innerHTML = events.length ? events.slice(0, state.limit).map(event => cardMarkup(event)).join("") : '<p class="empty">条件に合う掲載イベントはありません。</p>';
  $("#load-more").hidden = events.length <= state.limit;
}
function injectJsonLd() {
  const items = state.events.filter(event => !event.tentative && !event.isSample && !event.excluded_dates?.length).flatMap(event => (event.dates?.length ? event.dates : [event.start]).map(start => ({
    "@context": "https://schema.org", "@type": "Event", name: event.title, startDate: start, endDate: event.dates?.length ? start : event.end || event.start,
    eventStatus: event.cancelled ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: event.venue || "会場要確認", address: "群馬県高崎市" },
    description: event.summary || "", ...(safeUrl(event.official_url) ? { url: event.official_url } : {})
  })));
  $("#jsonld-events").textContent = JSON.stringify(items);
}
init();
