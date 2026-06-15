// もてなし広場 イベント自動収集スクリプト（候補抽出）
// 各情報源を巡回し「もてなし広場」を含むイベントだけを candidates.json に書き出す。
// ※ 著作権配慮：本文の丸写しはせず「タイトル・日付・会場・出典URL」など事実情報のみ取得し、
//   紹介文は後から人が書く前提。最終的に人が確認して events.json へ反映する。
//
// 実行：  cd scraper && npm install && node scrape.mjs
// 出力：  ../data/candidates.json
//
// 注意：各サイトのHTML構造は変わることがあります。取得できなくなったら SOURCES の
//       セレクタを実際のページに合わせて直してください（壊れても他ソースは続行します）。

import { writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";

const VENUE_KEYWORDS = ["もてなし広場", "もてなしひろば"];
const UA = "Mozilla/5.0 (compatible; MotenashiEventBot/1.0; +contact)";

// 収集元の定義。list ページから「タイトル・リンク・日付らしき文字列」を拾う汎用パーサ。
// 区分A（自動収集向き）のみ。SNSは利用規約・技術制限で対象外（data/sources.md 参照）。
const SOURCES = [
  {
    name: "高崎市公式カレンダー",
    url: "https://www.city.takasaki.gunma.jp/calendar/",
    base: "https://www.city.takasaki.gunma.jp",
    rowSelector: "a[href*='/calendar/']",
  },
  {
    name: "高崎観光協会",
    url: "https://www.takasaki-kankoukyoukai.or.jp/?cat=99",
    base: "https://www.takasaki-kankoukyoukai.or.jp",
    rowSelector: "h2 a, h3 a, .entry-title a",
  },
  {
    name: "ぐんラボ！",
    url: "https://www.gunlabo.net/event/?city=10202",
    base: "https://www.gunlabo.net",
    rowSelector: "a[href*='/event/event.shtml']",
  },
  {
    name: "まいぷれ高崎",
    url: "https://takasaki.mypl.net/event/",
    base: "https://takasaki.mypl.net",
    rowSelector: "a[href*='/event/']",
  },
  {
    name: "タウンぐんま",
    url: "https://towngunma.jp/",
    base: "https://towngunma.jp",
    rowSelector: "h2 a, h3 a, .entry-title a, article a",
  },
  {
    name: "高崎やる気堂（人情市ブログ）",
    url: "https://ninjou.gunmablog.net/",
    base: "https://ninjou.gunmablog.net",
    rowSelector: "h2 a, h3 a, .article-title a, a[href*='/e']",
  },
  {
    name: "群馬キッチンカー協同組合",
    url: "https://gkca.jp/",
    base: "https://gkca.jp",
    rowSelector: "h2 a, h3 a, .entry-title a, article a",
  },
];

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// テキストから「YYYY-MM-DD」を推定（M月D日 / YYYY年M月D日 などに対応）
function guessDate(text) {
  let m = text.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (m) return iso(m[1], m[2], m[3]);
  m = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (m) {
    const y = new Date().getFullYear();
    return iso(y, m[1], m[2]);
  }
  return "";
}
const iso = (y, mo, d) =>
  `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

async function scrapeSource(src) {
  const out = [];
  try {
    const html = await fetchHtml(src.url);
    const $ = cheerio.load(html);
    $(src.rowSelector).each((_, el) => {
      const $el = $(el);
      const title = $el.text().replace(/\s+/g, " ").trim();
      // タイトル or 近傍テキストに会場キーワードがあるものだけ
      const context = ($el.closest("li,article,tr,div").text() || title);
      if (!VENUE_KEYWORDS.some((k) => context.includes(k) || title.includes(k))) return;
      let href = $el.attr("href") || "";
      if (href && !href.startsWith("http")) href = src.base + href;
      if (!title) return;
      out.push({
        title,
        start: guessDate(context),
        venue: "もてなし広場",
        source: src.name,
        source_url: href || src.url,
      });
    });
  } catch (err) {
    console.error(`[${src.name}] 取得失敗: ${err.message}`);
  }
  return out;
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((it) => {
    const key = `${it.title}|${it.start}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  let all = [];
  for (const src of SOURCES) {
    const items = await scrapeSource(src);
    console.log(`[${src.name}] ${items.length} 件`);
    all = all.concat(items);
  }
  all = dedupe(all).map((it, i) => ({
    id: `cand-${Date.now()}-${i}`,
    category: "未分類",
    summary: "",
    fee: "",
    tags: [],
    status: "draft", // 人が確認するまで公開しない
    needsReview: true,
    ...it,
  }));

  await writeFile(
    new URL("../data/candidates.json", import.meta.url),
    JSON.stringify({ generated: new Date().toISOString(), candidates: all }, null, 2),
    "utf8"
  );
  console.log(`\n候補 ${all.length} 件を data/candidates.json に出力しました。`);
  console.log("→ 内容を確認し、掲載するものを events.json に移してください。");
}

main();
