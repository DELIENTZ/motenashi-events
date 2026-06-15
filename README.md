# もてなし広場 イベントナビ

高崎市・もてなし広場のイベントをまとめる無料サイト。
**静的サイト（HTML/CSS/JS）＋自動収集（GitHub Actions）＋手動登録（フォーム）** のハイブリッド構成。

---

## 1. これは何ができるサイトか

- `data/events.json` に書いたイベントを、日付順・カテゴリ別・検索で表示
- スマホ対応・SEO対応（Googleのイベント検索向け構造化データ JSON-LD 入り）
- 広告枠を最初から設置（AdSense / 楽天 / A8 を後から差し込める）
- 「情報を提供する」フォームで読者から投稿を受け付け

データは1つのファイル（`data/events.json`）を編集するだけで更新できます。**プログラミング不要で運用可能**です。

---

## 2. フォルダ構成

```
motenashi-events/
├ index.html              … サイト本体（これを公開する）
├ assets/
│  ├ style.css            … デザイン
│  └ app.js               … 表示ロジック（触らなくてOK）
├ data/
│  ├ events.json          … ★掲載イベント（ここを編集して更新）
│  └ candidates.json      … 自動収集された「候補」（自動生成・確認用）
├ scraper/
│  ├ scrape.mjs           … 自動収集スクリプト
│  └ package.json
└ .github/workflows/
   └ scrape.yml           … 週1回の自動収集（GitHub Actions）
```

---

## 3. すぐ試す（ローカル確認）

`data/events.json` を読み込む都合上、ファイルを直接開くのではなく簡易サーバーで開きます。

```bash
cd motenashi-events
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

---

## 4. 無料で公開する（おすすめ：GitHub Pages）

1. [GitHub](https://github.com/) で無料アカウントを作成
2. 新しいリポジトリ（例：`motenashi-events`）を作り、このフォルダの中身を push
3. リポジトリの **Settings → Pages** で「Deploy from a branch / main / root」を選択
4. 数分で `https://<ユーザー名>.github.io/motenashi-events/` に公開されます

> 独自ドメイン（例：`motenashi-event.com`）も後から設定可能。年1000円程度。

代替の無料ホスティング：**Cloudflare Pages** / **Netlify**（どれもGitHub連携で自動デプロイ）。

---

## 5. イベントを追加・更新する（手動）

`data/events.json` の `events` 配列に1件追加するだけ。テンプレート：

```json
{
  "id": "好きな半角英数ID",
  "title": "イベント名",
  "start": "2026-07-19",
  "end": "2026-07-19",
  "time": "10:00〜16:00",
  "venue": "もてなし広場",
  "category": "グルメ",
  "summary": "1〜2行の紹介文（自分の言葉で書く）",
  "fee": "入場無料",
  "official_url": "https://主催者の公式URL",
  "source": "出典名",
  "source_url": "https://出典URL",
  "tags": ["ファミリー", "グルメ"],
  "status": "published"
}
```

- `start` / `end` は `YYYY-MM-DD` 形式
- `status` を `"draft"` にすると非表示（下書き）
- サンプル表示が出ている間は各イベントに `"isSample": true` が付いています。本番データに差し替えたら消してください。
- `site.updated` の日付も更新するとフッターの「最終更新」に反映されます

---

## 情報源の一覧

巡回・チェックする情報源（公式・主催団体・ポータル・SNS）は **[data/sources.md](data/sources.md)** にまとめています。
「A=自動収集向き／M=手動チェック向き（SNS等）」で区分。新しい主催団体を見つけたらここに足していきます。

## 6. 自動収集の仕組み

`.github/workflows/scrape.yml` が **毎週月曜6時（日本時間）** に `scraper/scrape.mjs` を実行し、
各情報源から「もてなし広場」を含むイベントを拾って `data/candidates.json` に書き出します。

**重要：自動収集された候補はそのまま公開されません。** `candidates.json` を見て、
掲載するものを手で `events.json` に移す運用です（事実確認＋紹介文を自分の言葉で書く）。

手動実行：GitHubの **Actions タブ → イベント自動収集 → Run workflow**。

### 著作権について（必読）
- 日付・会場・イベント名などの**事実情報**には著作権はありません。安心して使えます。
- ただし他サイトの**紹介文・写真をそのままコピーするのはNG**です。
- このサイトは「事実を集約＋自分の言葉の短い紹介＋出典リンク」で運用してください。これが安全かつSEO的にも有利です。

---

## 7. 読者からの情報提供フォーム

1. [Googleフォーム](https://forms.google.com/) で「イベント名／日付／会場／内容／URL」などの項目を作る
2. 発行された公開URLを2か所に設定：
   - `assets/app.js` の先頭 `const SUBMIT_FORM_URL = "...";`
   - （任意）`index.html` のボタンも同URLに
3. 投稿はGoogleスプレッドシートに溜まるので、内容を確認して `events.json` に転記

> 将来的に、スプレッドシートを自動で読み込んで反映する仕組みにも拡張できます。

---

## 8. 収益化（広告）

`index.html` に広告枠を2つ用意済み（`.ad-slot`）。準備ができたら差し替えます。

| 方法 | 向き | 始め方 |
|------|------|--------|
| **Google AdSense** | アクセスが増えてから | 審査通過後、発行コードを `index.html` の `<head>` と枠内に貼る |
| **A8.net / もしも** | 最初から可 | 高崎の宿・レジャー・グルメ系の広告バナーを枠に貼る |
| **楽天アフィリエイト** | 最初から可 | 「高崎 ホテル」等の商品リンクを記事下枠に |

地域イベントサイトは「近隣の宿・駐車場・飲食」と相性が良いので、AdSenseよりも
**地域に合った物販／予約系アフィリエイト**の方が収益化しやすい傾向です。

---

## 9. これからの拡張案

- イベント詳細ページ（個別URL）でSEO強化
- 地図表示（もてなし広場へのアクセス）
- カレンダー表示・LINE/Instagram連携
- スプレッドシート→サイト自動反映
- 「出店者募集」情報の特集ページ
