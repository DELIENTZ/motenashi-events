# 公開手順（GitHub → Cloudflare Pages）

非エンジニア向け・GUIだけで完結する手順。コマンドは不要です。
所要：初回30〜40分くらい。一度設定すれば、以降は更新が自動で反映されます。

ローカルのgit準備（初回コミット）は済んでいます。あとは「GitHubに上げる→Cloudflareにつなぐ」だけ。

---

## STEP 1：GitHubアカウントを作る（5分）

1. https://github.com/signup を開く
2. メール（会社の `a.yokoyama@takasakiknocks.jp` 等）・パスワード・ユーザー名を登録
   - ユーザー名は公開URLに入る可能性あり。例：`delientz` `takasaki-event` など分かりやすいもの
3. メール認証を済ませる（無料プランでOK）

---

## STEP 2：GitHub Desktop でアップロード（10分）

1. https://desktop.github.com/ から **GitHub Desktop** をダウンロードして開く
2. 起動後 **「Sign in to GitHub.com」** → ブラウザでSTEP1のアカウントにログイン → 承認
3. メニュー **File → Add Local Repository**
4. **Choose...** で次のフォルダを選択：
   `…/DELIENTZ/motenashi-events`
   （すでにgit管理済みなのでそのまま認識されます）
5. 右側の **「Publish repository」** ボタンを押す
   - Name：`motenashi-events`（好きでOK）
   - **「Keep this code private」のチェックは外す**（＝公開。Cloudflareが読めるように）
   - **Publish repository** を押す → GitHubにアップ完了 🎉

> これで `https://github.com/＜ユーザー名＞/motenashi-events` にコードが乗りました。

---

## STEP 3：Cloudflare Pages につなぐ（10分）

1. https://dash.cloudflare.com/sign-up でCloudflareアカウントを作る（無料）
2. 左メニュー **「Workers & Pages」** → **Create** → **Pages** タブ → **「Connect to Git」**
3. GitHubと連携を許可（**Authorize**）。`motenashi-events` リポジトリを選ぶ
4. **Set up builds and deployments** の設定：

   | 項目 | 入力する値 |
   |---|---|
   | Production branch | `main` |
   | Framework preset | **None** |
   | Build command | **（空欄のまま）** |
   | Build output directory | `/` |

5. **Save and Deploy** を押す → 1〜2分で公開

> 公開URL：`https://motenashi-events.pages.dev`（このような形で発行されます）

---

## STEP 4：これで自動運用に入ります

- **更新方法**：GitHub上で `data/events.json` を編集して保存（コミット）するだけ。
  → Cloudflareが自動で再公開します（数十秒〜数分）。
- **自動収集**：毎週月曜朝、GitHub Actionsが各サイトを巡回し `data/candidates.json` を更新。
  内容を見て、載せたいものを `events.json` に移す。

### GitHub上での編集のしかた（コマンド不要）
1. `https://github.com/＜ユーザー名＞/motenashi-events` を開く
2. `data` → `events.json` をクリック → 鉛筆アイコン ✏️ で編集
3. 下部の **Commit changes** を押す → 自動で本番反映

---

## 困ったら
- 公開されない／404 → Cloudflareの **Build output directory** が `/` か確認
- 画像やCSSが出ない → ファイルのパスがずれていないか（`assets/` 構成のまま）
- 独自ドメイン（例 `motenashi-event.com`）を後で付けたい → Cloudflare Pages の **Custom domains** から設定可
