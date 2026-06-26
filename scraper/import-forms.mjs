// Googleフォーム回答シートから、掲載前確認用の候補JSONを作る。
// イベント投稿: data/form-candidates.json
// 仲間募集: data/join-candidates.json

import { writeFile } from "node:fs/promises";

const DEFAULT_EVENT_FORM_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1r-6a_LR5unrDmN9HNJCS_77TxRgqQfsp3KkSADXTlLY/gviz/tq?tqx=out:csv&sheet=Form%20Responses%201";
const DEFAULT_JOIN_FORM_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1r-6a_LR5unrDmN9HNJCS_77TxRgqQfsp3KkSADXTlLY/gviz/tq?tqx=out:csv&sheet=%E4%BB%B2%E9%96%93%E5%8B%9F%E9%9B%86";

const EVENT_FORM_CSV_URL = process.env.EVENT_FORM_CSV_URL || DEFAULT_EVENT_FORM_CSV_URL;
const JOIN_FORM_CSV_URL = process.env.JOIN_FORM_CSV_URL || DEFAULT_JOIN_FORM_CSV_URL;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => String(v).trim()));
}

async function fetchRows(url) {
  if (!url) return [];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CSV取得失敗: HTTP ${res.status}`);
  const rows = parseCsv(await res.text());
  const headers = rows.shift() || [];
  return rows.map((row) =>
    Object.fromEntries(headers.map((h, i) => [String(h).trim(), row[i] || ""]))
  );
}

function dateToIso(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) return iso(m[1], m[2], m[3]);
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return iso(m[3], m[1], m[2]);
  m = s.match(/^(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (m) return iso(m[1], m[2], m[3]);
  return s;
}

function iso(y, m, d) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function idPart(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function eventCandidate(row, i) {
  const title = row["イベント名"] || "";
  const start = dateToIso(row["開催日（初日）"]);
  const end = dateToIso(row["終了日（複数日にわたる場合のみ）"]) || start;
  const url = row["公式サイト・SNSのURL"] || row["チラシ画像のURL（任意）"] || "";
  return {
    id: `form-${start || "unknown"}-${idPart(title) || i + 1}`,
    title,
    start,
    end,
    time: row["開催時間"] || "",
    venue: row["会場"] || "もてなし広場",
    category: row["カテゴリ"] || "未分類",
    summary: row["イベント内容・紹介"] || "",
    image: row["チラシ画像のURL（任意）"] || "",
    fee: row["入場料"] || "",
    official_url: row["公式サイト・SNSのURL"] || "",
    source: "Googleフォーム投稿",
    source_url: url,
    organizer_contact: row["主催者・お問い合わせ先（任意）"] || "",
    provider_contact: row["ご提供者のお名前・ご連絡先（任意）"] || "",
    tags: [],
    status: "draft",
    needsReview: true,
    received_at: row["Timestamp"] || "",
  };
}

function joinCandidate(row, i) {
  return {
    id: `join-${dateToIso(row["Timestamp"]) || i + 1}-${i + 1}`,
    name: row["お名前"] || row["名前"] || "",
    contact: row["連絡先"] || row["メールアドレス"] || row["ご連絡先"] || "",
    interests: row["お手伝いできること"] || row["できること"] || "",
    frequency: row["活動できる頻度"] || "",
    message: row["メッセージ"] || row["ひとこと"] || "",
    consent: row["確認事項"] || "",
    source: "仲間募集フォーム",
    status: "unread",
    needsReview: true,
    received_at: row["Timestamp"] || "",
  };
}

async function main() {
  const eventRows = await fetchRows(EVENT_FORM_CSV_URL);
  const eventCandidates = eventRows
    .map(eventCandidate)
    .filter((item) => item.title || item.start || item.summary);

  await writeFile(
    new URL("../data/form-candidates.json", import.meta.url),
    JSON.stringify({ generated: new Date().toISOString(), candidates: eventCandidates }, null, 2),
    "utf8"
  );
  console.log(`フォーム投稿イベント ${eventCandidates.length} 件を出力しました。`);

  if (JOIN_FORM_CSV_URL) {
    const joinRows = await fetchRows(JOIN_FORM_CSV_URL);
    const joinCandidates = joinRows
      .map(joinCandidate)
      .filter((item) => item.name || item.contact || item.message || item.interests);
    await writeFile(
      new URL("../data/join-candidates.json", import.meta.url),
      JSON.stringify({ generated: new Date().toISOString(), candidates: joinCandidates }, null, 2),
      "utf8"
    );
    console.log(`仲間募集 ${joinCandidates.length} 件を出力しました。`);
  } else {
    await writeFile(
      new URL("../data/join-candidates.json", import.meta.url),
      JSON.stringify(
        {
          generated: new Date().toISOString(),
          candidates: [],
          note: "JOIN_FORM_CSV_URL をGitHub Actionsの変数に設定すると自動取得します。",
        },
        null,
        2
      ),
      "utf8"
    );
    console.log("JOIN_FORM_CSV_URL 未設定のため、仲間募集は空で出力しました。");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
