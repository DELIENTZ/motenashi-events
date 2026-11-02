# 情報源リスト（高崎市のイベント）

高崎市内のイベントを拾う情報源の一覧。もてなし広場の既存情報源も継続確認する。
**A=自動収集向き**（HTMLが取れる。scraper対象にできる） / **M=手動チェック向き**（SNS等。ログイン・利用規約の制約で自動取得は不可、目視で確認）

---

## 公式・行政（信頼度◎）

| 種別 | 名前 | URL | 区分 | メモ |
|---|---|---|---|---|
| 行政 | 高崎市 公式イベントカレンダー | https://www.city.takasaki.gunma.jp/calendar/ | A | 一次情報。まずここ |
| 観光 | 高崎観光協会 イベント | https://www.takasaki-kankoukyoukai.or.jp/?cat=99 | A | もてなし広場系が多い |
| 行政 | 高崎市 農政課・農業まつり | https://www.city.takasaki.gunma.jp/page/5227.html | A | 2026-11-02再確認：10/28に第39回・令和8年11/21〜22・10〜15時・小雨決行の正式告知へ更新。以前の2025年本文と区別 |
| 主催者 | 高崎商工会議所 イベント・まちづくり | https://www.takasakicci.or.jp/event/ | A | 第98回高崎えびす講市は2026年11/21〜22、中心市街地。もてなし広場開催と断定せず、ユーザーの依頼により周辺イベントとして区別 |

## 高崎市全域の会場・小規模イベント（2026-11-02追加）

### Gメッセ群馬（2026-11-02追記）
- 会場公式イベント一覧：https://www.g-messe-gunma.jp/visitor-event.html 。一般公開・事前登録可能な催しを対象に、月日だけでなく主催者の当該年情報も照合する。関係者・会員限定の催しを一般公開と扱わない。
- 今回確認済み6件：オクトーバーフェスト高崎2026、東山魁夷と平山郁夫展（版画展示即売）、World Animal Festival!群馬、スターダム高崎大会、過労死等防止対策推進シンポジウム群馬会場、サンリオキャラクターフェス。
- 主催者等の一次情報：https://gunma-kanko.jp/events/351 、https://www.art-wao.com/ 、https://blackout-bega.com/news/archives/art/00122.html 、https://wwr-stardom.com/schedule/20261108_takasaki/ 、https://jsite.mhlw.go.jp/gunma-roudoukyoku/newpage_01081.html 、https://sanrio-character-fes.com/ 。
- 商業の版画展示販売を美術館の所蔵展・原画展と誤認させない。子どもの無料条件・一般の入場料・飲食物販代を区別。先行入場・一般開場・試合開始の時刻も区別する。
- サンリオは2026/12/29〜2027/1/7の会期を保持し、群馬会場の券価・体験詳細を全国共通案内から推測しない。スターダムの一部席種完売と開催中止は別。申込枠・残席を保証しない。
- 年・対象者・参加条件を照合できない候補は保留。今回のMAZZELは指定会員限定、AGTSは専門用途の展示会のため一般向け初期追加へ含めていない。採否と追加確認先は非公開の運用記録へ保存。

規模・有料無料を問わず高崎市内の一般来場者向け催しを対象とする。以下は新規追加した確認先で、全件の自動取得が実装済みという意味ではない。会員限定・関係者のみ・単なる施設予約や設営日は一般向けイベントへ転用しない。

| 情報源 | 公式URL | 確認する内容 |
|---|---|---|
| 高崎芸術劇場・高崎財団の公演 | https://www.takasaki-foundation.or.jp/theatre/concert_calendar.php | 各公演詳細で開催年・会場・開場/開演・券価・発売状況・年齢条件を照合。劇場以外の文化会館の公演も含む |
| 高崎アリーナ | https://www.takasaki-foundation.or.jp/arena/news_detail.php?id=538 | 2026年11月予定表（10/20再掲）。観覧の可否・料金を確認し、主催競技団体の案内も併用。選手参加料と観覧料は別 |
| ビエント高崎 | https://www.viento-takasaki.or.jp/event/ | 展示会・地域催事。入場料・一般対象・各日の時間を確認 |
| 高崎市美術館 | https://www.city.takasaki.gunma.jp/site/art-museum/93842.html | 2026年会期、料金、休館日。関連事業は別日程で登録 |
| 高崎市タワー美術館 | https://www.city.takasaki.gunma.jp/site/tower/95791.html | 2026年会期・休館日・観覧料と11/8の日本画ワークショップを区別 |
| 高崎市文化財情報・資料館 | https://www.city.takasaki.gunma.jp/site/cultural-assets/99422.html | 吉井郷土資料館等の展示・体験会。月曜休館や祝日例外も確認 |
| まなびネットたかさき | https://www.takasaki.manabi365.net/ | 公民館等の小規模コンサート・講座・地域行事。対象者・先着定員・要申込・料金を個別ページで確認 |
| 日本卓球協会 | https://jtta.or.jp/tour/35621 | 全日本カデット2026は11/6〜8・高崎アリーナ。練習日と競技日を区別 |
| 日本体操協会 | https://jpn-gym.or.jp/event/event-8004/ | ジュニア新体操チャレンジカップ11/26。観覧時間・券価が不明なら未確認として案内 |

### データ登録とフィルターの約束
- `venues` は会場絞り込み用の正式な施設名配列。`venue` はホール名等を含む来場先の詳細表記。会場タグだけではホールが不明にならないよう両方を保持する。
- `fee_type` は `free / paid / mixed / unknown`。基本の入場・観覧料で分類する。任意の飲食・物販代は入場料と分け、詳細を `fee` に記す。一般有料・年齢等の免除対象ありの展示は `paid` とし、無料対象を詳細に記す。無料エリア・有料企画が併存する催しは `mixed`。未記載を `free` にしない。
- `excluded_dates` に確認済みの休館・休催日を保存。カレンダーには出さない。`dates` がある場合はその列挙日のみ開催として扱い、開催していない間の日付を埋めない。
- `checked` は実際に一次情報を確認した日本時間の日付。未確認項目や将来の空席・予約成功を保証しない。
- 2026-11-02、市農政課の10/28正式告知で第39回農業まつり11/21〜22・10〜15時・小雨決行を確認し、従来の出店者情報による暫定掲載を更新。人情市11月は主催者11/1告知 https://ninjou.gunmablog.net/e460796.html を優先。
- 「四季」は調査担当の結果と表示が異なったため、主担当が公式公演詳細を実ブラウザで再確認し「残席少」を採用。チケットの購入可否は公式窓口で確認する。
- 新規追加17件の調査過程・除外理由・確認日時は非公開のHP運用フォルダ内タスク記録へ保存。公開データへメールや個人の連絡先を混ぜない。アリーナ公式11月予定表の画像を実ブラウザで開き、11/3バレーボール決勝、11/22武術太極拳、11/27〜29ジュニア新体操も追加。「関係者」とされる11/14の大会は一般来場者向け掲載に採用しない。

## 主催団体（一次情報・最重要）

| 名前 | 主な担当イベント | リンク | 区分 | メモ |
|---|---|---|---|---|
| NPO法人 高崎やる気堂 | **高崎人情市**、ナイトシアター 等 | ブログ https://ninjou.gunmablog.net/ ／ 2026年度予定表 http://www.itfnet.co.jp/yarukido/pdf_etc/2026schedule.pdf ／ Instagram | A（ブログRSS）＋M（IG・PDF目視） | 第4日曜から日付を生成しない。2026〜2027年度の公式事業計画では10/25休み、11/29第275回、12/27第276回。開催日の変更・詳細は最新告知を優先 |
| 群馬キッチンカー協同組合 | **車楽祭**、マルシェ／キッチンカー系 | https://gkca.jp/ | A | キッチンカー系イベントの母体 |
| 琉球の風 実行委員会 | **琉球の風 ～沖縄祭り in 高崎～** | https://ryukyunokaze.jp/ | M（動的表示） | 2026年は第3回・10/17。チケット https://ryukyunokaze.jp/pages/ticket.html 、時間 https://ryukyunokaze.jp/pages/schedule.html 。10/9発表の当日Sエリアランクアップと前売Sエリア完売を区別。非表示の終了メッセージを開催状況と誤認しない |
| 高崎市青年商業者研究会（TSK） | **TSKフェス with ゴム動力自動車コンテスト** | https://tsk1958.net/gomucar/ ／ https://www.instagram.com/tsk_fes_pr/ | A＋M（IG） | 2026年10/25・もてなし広場。公式投稿 https://www.instagram.com/p/DeS7ll0o3mg/ で10:00〜16:00、入場無料・雨天決行を確認。体験ごとの料金・予約条件は別に確認 |
| 高崎おとまちプロジェクト内 拝啓ボウイ様実行委員会 | **拝啓ボウイ様** | https://takasaki-otomachi.com/haikeiboowysama/ | A | 2026-10-26再確認：10/31 12:30〜19:00・11/1 10:00〜19:00、もてなし広場、観覧無料、雨天決行・荒天中止。土曜13:00の旧表記は使わない。雨天は内容変更の場合あり。BOØWY本人の出演と誤認させない |
| Takasaki Christmas Marche実行委員会 | **高崎クリスマスマルシェ** | https://www.instagram.com/takasaki.x.marche/ | M（IG） | 2026年12/12〜13、もてなし広場、入場無料・雨天決行・荒天中止。終了は土曜19:00／日曜18:30。プロフィールは10:00開始、2026年告知画像は11:00開始のため開始時刻は未確定。投稿本文の旧年表記より告知画像・現プロフィールの2026年表記を照合 |
| 群馬蚤の市 主催者 | **群馬蚤の市** | https://www.instagram.com/gunma_nominoichi/ | M（IG） | 2026-10-26発見・公式本文確認。第1回は2026年12/19（土）9:00〜15:00、もてなし広場、入場無料、雨天開催・荒天中止。最新告知 https://www.instagram.com/p/De3fhtqo3ug/ 、初回告知 https://www.instagram.com/p/Dc-ys4nI-rL/ 。古道具・アンティーク等の市。出店募集の条件と一般入場の条件を混同しない |
| キングオブパスタ実行委員会 | **キングオブパスタ** | https://www.kingofpasta.jp/ | A | 開催概要 https://www.kingofpasta.jp/aboutus 、チケット https://www.kingofpasta.jp/ticket 、Q&A https://www.kingofpasta.jp/qanda 、新着 https://www.kingofpasta.jp/newslist 。2026-10-26再確認：11/15、前売10/16〜11/14。JTBコンビニ・楽天チケットMINI・JRE MALLチケットの案内あり。JTB窓口のネット申込不可を全購入方法へ一般化しない。入場無料、パスタはチケット制。当日全日券は10:30〜。販売窓口の残券は別途確認 |
| たかさき雷舞フェスティバル実行委員会（高崎市観光課） | **たかさき雷舞フェスティバル** | https://takasaki-live.com/ | A＋M（IG） | 2026年は第23回・10/11。もてなし広場10:00〜17:00、駅前通り10:30〜15:00。公式トップ画像に雨天決行。中止・変更は公式サイト・Facebookで案内 |
| 高崎太鼓まつり実行委員会（問い合わせ：高崎市文化課） | **たかさき太鼓祭り** | https://takasaki-taikomatsuri.com/ | A | 2026年は10/10（土）10:00〜19:00、入場無料。もてなし広場特設ステージ、雨天時は音楽センター。開催案内 https://takasaki-taikomatsuri.com/news/357/ |
| 高崎市役所 商業観光課 等 | 行政主催の催事 | 市公式サイト内 | A | カレンダー経由 |
| （要確認）司厨士協会 高崎支部 | 食の催事に絡む可能性 | — | M | 横山代表が関わり有。グルメ企画の情報源候補 |

## 出店者の公式告知（予定の補足・主催者発表とは区別）

- みるく工房タンポポ：https://www.tan-popo.co.jp/news ／ 農業まつりの個別案内：https://www.tan-popo.co.jp/news-detail/5 。2026年11/21〜22、10:00〜15:00、もてなし広場と明記。2026-11-02時点では市農政課の2026年正式告知を確認済み。主催者の最新案内を優先し、出店者の案内は補足として扱う。

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
- **定期調査・2026-10-26確認**：2026年10月〜2027年1月の各月を年・月・会場名で検索し、市の各月カレンダー、文化・観光の新着、主催者の最新案内を照合。第1回群馬蚤の市を12/19の新規掲載として追加。拝啓ボウイ様の10/31開始を12:30へ訂正、キングオブパスタの前売案内を発売後の窓口・条件へ更新。農業まつりの市ページは引き続き2025年の本文。市議会 https://www.city.takasaki.gunma.jp/site/gikai/4494.html の10/26報告事項と令和8年度市民参加実施計画 https://www.city.takasaki.gunma.jp/uploaded/attachment/39067.pdf では第39回・11月予定までで、今年の開催日・会場の確認には不足。出店者情報だけで未確定を解除しない。太鼓祭りは公式10/13終幕記事、雷舞は公式2026年案内を再確認。年始の駅前通り開催やGメッセ開催は広場イベントに混ぜない。検索で見つからないことをイベント不存在の根拠にしない。
- **農業まつり・えびす講市・2026-10-08確認**：年・会場付きのオンライン検索を行い、未掲載の2件を発見。農業まつりの市公式ページはライブ表示でも2025年の案内で、今年の根拠には使わない。出店者の公式個別ページで2026年の日付・時間・会場を確認し、主催者確認中の予定として掲載。えびす講市は高崎商工会議所の2026年イベント一覧で第98回・11/21〜22・中心市街地を確認し、広場のイベントとは区別する。両方の料金・雨天対応は未確認のため断定しない。次回の月2回調査でも市農政課と商工会議所の新着を再確認する。
- **太鼓祭り・2026-10-08確認**：横山さんから届いた公式開催案内 https://takasaki-taikomatsuri.com/news/357/ （2026-09-08公開）を実際のブラウザで確認。令和8年10月10日（土）10:00〜19:00、入場無料、もてなし広場特設ステージ、雨天時は音楽センター。主催は高崎太鼓まつり実行委員会。チケットの要否は明記がないため、入場無料を「チケット不要」へ置き換えない。
- **雷舞・2026-10-08確認**：開催日・時間・事前申込不要・22チーム／飲食18店舗は市カレンダー https://www.city.takasaki.gunma.jp/calendar/index.php?d=11&dsp=1&m=10&y=2026 、名称・会場は https://takasaki-live.com/guide.html で確認。交通規制は https://www.city.takasaki.gunma.jp/page/97831.html （10:00〜15:30、あら町交差点〜駅前交差点全面通行止め。一部バス停利用不可）。観覧料・チケット要否は一次情報で明記を確認できず、掲載データのfeeは空欄。主催者Instagram https://www.instagram.com/p/DeLt2ypn2ca/ でも10時〜17時のタイムテーブルを確認。
- **自動（A）**：scraperが巡回 → `candidates.json` に候補化 → 人が確認 → `events.json` へ。
- **手動（M/SNS）**：週1回まとめて目視 → 良い情報を直接 `events.json` に登録。
- 主催団体（やる気堂・キッチンカー組合）とは将来「情報を直接もらう」関係を作れると最強。投稿フォームの案内をDMで送るのも手。
- 著作権配慮：日付・会場・名称などの事実＋自分の言葉の紹介＋出典リンクで運用。本文・写真の転載はしない。
