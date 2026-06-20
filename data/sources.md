# 情報源リスト（もてなし広場イベント）

「もてなし広場」のイベントを拾う情報源の一覧。
**A=自動収集向き**（HTMLが取れる。scraper対象にできる） / **M=手動チェック向き**（SNS等。ログイン・利用規約の制約で自動取得は不可、目視で確認）

---

## 公式・行政（信頼度◎）

| 種別 | 名前 | URL | 区分 | メモ |
|---|---|---|---|---|
| 行政 | 高崎市 公式イベントカレンダー | https://www.city.takasaki.gunma.jp/calendar/ | A | 一次情報。まずここ |
| 観光 | 高崎観光協会 イベント | https://www.takasaki-kankoukyoukai.or.jp/?cat=99 | A | もてなし広場系が多い |

## 主催団体（一次情報・最重要）

| 名前 | 主な担当イベント | リンク | 区分 | メモ |
|---|---|---|---|---|
| NPO法人 高崎やる気堂 | **高崎人情市**（毎月第4日曜）、ナイトシアター 等 | ブログ https://ninjou.gunmablog.net/ ／ Instagram | A（ブログRSS）＋M（IG） | gunmablogはRSS配信あり→自動取得しやすい |
| 群馬キッチンカー協同組合 | **車楽祭**、マルシェ／キッチンカー系 | https://gkca.jp/ | A | キッチンカー系イベントの母体 |
| 高崎市役所 商業観光課 等 | 行政主催の催事 | 市公式サイト内 | A | カレンダー経由 |
| （要確認）司厨士協会 高崎支部 | 食の催事に絡む可能性 | — | M | 横山代表が関わり有。グルメ企画の情報源候補 |

## ポータル・メディア（二次情報・網羅性◎）

| 名前 | URL | 区分 | メモ |
|---|---|---|---|
| ぐんラボ！（高崎） | https://www.gunlabo.net/event/?city=10202 | A | 件数多い |
| まいぷれ高崎 | https://takasaki.mypl.net/event/ | A | 地域密着 |
| タウンぐんま | https://towngunma.jp/ | A | 記事形式。車楽祭等を掲載 |
| fmfm.jp（フリマ・マルシェ） | https://fmfm.jp/event/detail/8354 | A | フリマ／クラフト系 |
| ジモティー（高崎マルシェ） | https://jmty.jp/gunma/eve-all/g-all/a-167-takasaki | A | 個人主催も拾える |
| じゃらん（もてなし広場周辺） | https://www.jalan.net/kankou/spt_guide000000166437/event/ | A | 観光寄り |
| キッチンカーナビ | https://kitchencar-navi.jp/event/ | A | キッチンカー出店情報 |
| ぐんま花火・お祭り | https://gunmahanabi.com/category/takasaki/ | A | 祭・花火系 |

## SNS（速報性◎・自動取得は不可＝手動チェック）

> Instagram・X・Facebook は利用規約と技術的制限で自動スクレイピング不可。**フォローして目視**、または良い投稿を見つけたら手動で `events.json` に登録するのが現実的。

| 媒体 | アカウント | リンク |
|---|---|---|
| X | 高崎観光協会 | https://x.com/takasakikankou ／ https://twitter.com/kankoutakasaki |
| Instagram | 高崎観光協会 | https://www.instagram.com/takasaki_tourism_assoc/ |
| Facebook | 高崎観光協会 | https://www.facebook.com/takasaki.kankoukyoukai/ |
| Instagram | 高崎やる気堂（人情市・公式） | https://www.instagram.com/takasakiyarukido/ |
| Instagram | ハッシュタグ #高崎イベント | https://www.instagram.com/explore/tags/高崎イベント/ |
| Instagram | たかさき車楽祭（キッチンカー・マルシェ） | https://www.instagram.com/sharakusai_takasaki/ |
| Instagram | ハッシュタグ #もてなし広場 #高崎マルシェ #高崎人情市 | 目視チェック用 |

### スクショから追加（横山代表が拾ったアカウント・2026-06-20）

| 媒体 | アカウント | リンク | 関連イベント |
|---|---|---|---|
| Instagram | タイフェスティバル高崎（公式） | https://www.instagram.com/thai.fes.takasaki/ | THAI FESTIVAL TAKASAKI（7/19-20） |
| Instagram | ダンビー／琉球の風（dan-b.com） | https://www.instagram.com/wwwdanbcom/ | 琉球の風（日付要確認） |
| Instagram | みらくる | https://www.instagram.com/mirakuru3096/ | AAA Vintage Market（7/18）出店 |
| Instagram | エムズ英会話 | https://www.instagram.com/emzenglish2001/ | World Night Market（7/31）出店 |
| Instagram | paton_ko | https://www.instagram.com/paton_ko/ | 地域イベントのリポスト元 |
| Instagram | matsumura_takeshi | https://www.instagram.com/matsumura_takeshi/ | 人情市ステージ（雷舞）等 |

---

## 運用メモ
- **自動（A）**：scraperが巡回 → `candidates.json` に候補化 → 人が確認 → `events.json` へ。
- **手動（M/SNS）**：週1回まとめて目視 → 良い情報を直接 `events.json` に登録。
- 主催団体（やる気堂・キッチンカー組合）とは将来「情報を直接もらう」関係を作れると最強。投稿フォームの案内をDMで送るのも手。
- 著作権配慮：日付・会場・名称などの事実＋自分の言葉の紹介＋出典リンクで運用。本文・写真の転載はしない。
