export const FEE_LABELS = { free: "無料", paid: "有料", mixed: "一部有料", unknown: "要確認" };
const jstDateFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" });

export function todayJst(now = new Date()) {
  return jstDateFormatter.format(now);
}

export function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function validDate(key) {
  return /^\d{4}-\d{2}-\d{2}$/.test(key || "") &&
    !Number.isNaN(Date.parse(key + "T00:00:00Z")) && dateKey(new Date(key + "T00:00:00Z")) === key;
}

export function eventVenues(event) {
  return [...new Set((event.venues?.length ? event.venues : [event.venue || "会場要確認"]).filter(Boolean))];
}

export function eventTerms(event) {
  return [...new Set([event.category, ...(event.tags || [])].filter(Boolean))];
}

export function eventOnDate(event, key) {
  if (key < event.start || key > (event.end || event.start)) return false;
  if (event.dates?.length && !event.dates.includes(key)) return false;
  return !(event.excluded_dates || []).includes(key);
}

// Query only the visible range; do not expand long exhibitions into an unbounded map.
export function eventInRange(event, from, to) {
  const start = from && from > event.start ? from : event.start;
  const end = to && to < (event.end || event.start) ? to : (event.end || event.start);
  if (!validDate(start) || !validDate(end) || start > end) return false;
  if (event.dates?.length) return event.dates.some(key => key >= start && key <= end && eventOnDate(event, key));
  const excluded = new Set(event.excluded_dates || []);
  if (!excluded.size) return true;
  for (let day = new Date(start + "T00:00:00Z"); dateKey(day) <= end; day.setUTCDate(day.getUTCDate() + 1)) {
    if (!excluded.has(dateKey(day))) return true;
  }
  return false;
}

export function normalizedText(value = "") {
  return String(value).normalize("NFKC").toLocaleLowerCase("ja");
}

export function matchesEvent(event, filters, today = todayJst()) {
  if (!filters.tentative && event.tentative) return false;
  let from = filters.from || "";
  let to = filters.to || "";
  if (filters.period === "upcoming" && (!from || from < today)) from = today;
  if (filters.period === "past") {
    if ((event.end || event.start) >= today) return false;
  }
  if (!eventInRange(event, from, to)) return false;
  if (filters.venue && !eventVenues(event).includes(filters.venue)) return false;
  if (filters.fee && (event.fee_type || "unknown") !== filters.fee) return false;
  if (filters.category && event.category !== filters.category) return false;
  if (filters.tags?.length && !filters.tags.some(tag => eventTerms(event).includes(tag))) return false;
  const words = normalizedText(filters.query || "").trim().split(/\s+/).filter(Boolean);
  const haystack = normalizedText([event.title, event.summary, event.venue, ...eventVenues(event), ...eventTerms(event)].join(" "));
  return words.every(word => haystack.includes(word));
}

export function sortEvents(events, field = "date", direction = "asc") {
  const collator = new Intl.Collator("ja", { numeric: true });
  const value = event => field === "venue" ? eventVenues(event).join(" ") : field === "fee" ? FEE_LABELS[event.fee_type || "unknown"] : field === "title" ? event.title : event.start;
  return [...events].sort((a, b) => {
    const compared = collator.compare(value(a), value(b));
    return (compared || collator.compare(a.start, b.start) || collator.compare(a.id, b.id)) * (direction === "desc" ? -1 : 1);
  });
}
